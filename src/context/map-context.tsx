"use client";

/**
 * 지도 화면의 "단일 진실 공급원(Single Source of Truth)".
 *
 * 왜 Context 를 쓰나요?
 * MapScreen 아래에는 국가 버튼, 컬러핀, 도트맵, 타임피커, 상세 팝업이 따로 있습니다.
 * 이 모든 것이 같은 사진 배열·같은 필터를 봐야 합니다.
 * props 로 5단계 내려보내면 중간 컴포넌트가 안 쓰는 값까지 전달하게 되어
 * "데이터가 어디서 바뀌는지" 추적이 어려워집니다.
 *
 * 흐름:
 *  photos (카테고리 수정 가능)
 *    → country / time / color 필터
 *    → filteredPhotos
 *    → DotMap 은 개수로 명암, StreetMap 은 묶음/핀
 */

import { COUNTRY_BY_ID, COUNTRIES } from "@/data/country-masks";
import { latestPhotoYear, MOCK_PHOTOS } from "@/data/mock-photos";
import { maskToDots } from "@/lib/geo";
import { filterPhotos } from "@/lib/filters";
import { defaultFocusFromPhotos, focusForZoom, nextZoom, prevZoom } from "@/lib/zoom";
import type {
  CategoryColor,
  CategoryFilterKey,
  CountryId,
  MapFocus,
  Photo,
  TimeFilter,
  ZoomLevel,
} from "@/types/album";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** 마스크 → 점 변환은 앱이 켜지는 동안 한 번만. 줌이 바뀐다고 다시 파싱하지 않습니다. */
export const COUNTRY_DOTS = Object.fromEntries(
  COUNTRIES.map((country) => [country.id, maskToDots(country)]),
) as Record<CountryId, ReturnType<typeof maskToDots>>;

type MapContextValue = {
  photos: Photo[];
  filteredPhotos: Photo[];
  selectedCountryId: CountryId;
  setSelectedCountryId: (id: CountryId) => void;
  zoomLevel: ZoomLevel;
  focus: MapFocus | null;
  zoomIn: (around?: { lat: number; lng: number }) => void;
  zoomOut: () => void;
  jumpToCity: (lat: number, lng: number) => void;
  jumpToNeighborhood: (lat: number, lng: number) => void;
  selectedCategories: Set<CategoryFilterKey>;
  toggleCategory: (key: CategoryFilterKey) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (next: TimeFilter) => void;
  selectedPhotoId: string | null;
  selectedPhoto: Photo | null;
  openPhoto: (id: string) => void;
  closePhoto: () => void;
  setPhotoCategory: (photoId: string, category: CategoryColor) => void;
  countryModalOpen: boolean;
  setCountryModalOpen: (open: boolean) => void;
};

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  /**
   * mock 을 그대로 쓰지 않고 state 로 복사하는 이유:
   * 상세 팝업에서 색을 바꾸면 지도 테두리/도트 색이 바로 바뀌어야 합니다.
   * 모듈 상수 MOCK_PHOTOS 를 직접 고치면, 새로고침 전까지 다른 화면도 오염되고
   * React 는 배열이 바뀐 줄 모릅니다 (같은 참조).
   */
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [selectedCountryId, setSelectedCountryId] = useState<CountryId>("kr");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("country");
  const [focus, setFocus] = useState<MapFocus | null>(null);

  /**
   * Set 을 state 에 넣는 패턴: 토글할 때마다 새 Set 을 만듭니다.
   * 같은 Set 인스턴스를 mutate 하면 React 가 변경을 감지하지 못합니다.
   */
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryFilterKey>>(
    () => new Set(),
  );

  const [timeFilter, setTimeFilter] = useState<TimeFilter>({
    year: latestPhotoYear(MOCK_PHOTOS),
    month: null,
    day: null,
  });

  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const filteredPhotos = useMemo(
    () => filterPhotos(photos, selectedCountryId, timeFilter, selectedCategories),
    [photos, selectedCountryId, timeFilter, selectedCategories],
  );

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId],
  );

  const toggleCategory = useCallback((key: CategoryFilterKey) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const setPhotoCategory = useCallback((photoId: string, category: CategoryColor) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, category } : photo)),
    );
  }, []);

  const zoomIn = useCallback(
    (around?: { lat: number; lng: number }) => {
      const upcoming = nextZoom(zoomLevel);
      const target =
        around ??
        (filteredPhotos[0]
          ? { lat: filteredPhotos[0].lat, lng: filteredPhotos[0].lng }
          : null);
      setZoomLevel(upcoming);
      if (target) setFocus(focusForZoom(upcoming, target.lat, target.lng));
      else setFocus(null);
    },
    [filteredPhotos, zoomLevel],
  );

  const zoomOut = useCallback(() => {
    const upcoming = prevZoom(zoomLevel);
    setSelectedPhotoId(null);
    setZoomLevel(upcoming);
    if (upcoming === "country" || upcoming === "province") setFocus(null);
  }, [zoomLevel]);

  const jumpToCity = useCallback((lat: number, lng: number) => {
    setZoomLevel("city");
    setFocus(focusForZoom("city", lat, lng));
  }, []);

  const jumpToNeighborhood = useCallback((lat: number, lng: number) => {
    setZoomLevel("neighborhood");
    setFocus(focusForZoom("neighborhood", lat, lng));
  }, []);

  const handleSelectCountry = useCallback((id: CountryId) => {
    setSelectedCountryId(id);
    setZoomLevel("country");
    setFocus(null);
    setSelectedPhotoId(null);
    setCountryModalOpen(false);
    // 나라를 바꾸면 그 나라에 사진이 있는 최신 연도로 맞춰, 빈 화면부터 시작하지 않게 합니다.
    const inCountry = photos.filter((photo) => photo.countryId === id);
    if (inCountry.length > 0) {
      setTimeFilter((prev) => ({ ...prev, year: latestPhotoYear(inCountry) }));
    }
  }, [photos]);

  const openPhoto = useCallback((id: string) => setSelectedPhotoId(id), []);
  const closePhoto = useCallback(() => setSelectedPhotoId(null), []);

  const value: MapContextValue = {
    photos,
    filteredPhotos,
    selectedCountryId,
    setSelectedCountryId: handleSelectCountry,
    zoomLevel,
    // 도시/동 수준에서만 초점이 필요합니다. 국가·시/도는 나라 전체 도트맵을 그립니다.
    focus:
      zoomLevel === "city" || zoomLevel === "neighborhood"
        ? (focus ?? defaultFocusFromPhotos(filteredPhotos))
        : focus,
    zoomIn,
    zoomOut,
    jumpToCity,
    jumpToNeighborhood,
    selectedCategories,
    toggleCategory,
    timeFilter,
    setTimeFilter,
    selectedPhotoId,
    selectedPhoto,
    openPhoto,
    closePhoto,
    setPhotoCategory,
    countryModalOpen,
    setCountryModalOpen,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap 은 MapProvider 안에서만 사용할 수 있어요.");
  return ctx;
}

export function useCountryMeta() {
  const { selectedCountryId } = useMap();
  return COUNTRY_BY_ID[selectedCountryId];
}
