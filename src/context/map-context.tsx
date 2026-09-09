"use client";

/**
 * 지도 화면의 단일 진실 공급원.
 *
 * 흐름:
 *  photos → 국가/날짜/색 필터 → filteredPhotos
 *        → (줌 0~5) Circle 도트 GeoJSON
 *        → (줌 6~11) 묶음 핀
 *        → (줌 12+) 개별 핀
 *
 * 줌은 우리 state 가 아니라 MapLibre 지도 인스턴스의 실제 zoom 입니다.
 * +/- 버튼도 map.zoomIn() 을 호출해, 레이어 전환 기준(0~5 / 6~11 / 12+)과 어긋나지 않게 합니다.
 */

import { COUNTRY_BY_ID, COUNTRIES } from "@/data/country-masks";
import { latestPhotoYear, MOCK_PHOTOS } from "@/data/mock-photos";
import { countryBounds } from "@/lib/density-dots";
import { maskToDots } from "@/lib/geo";
import { filterPhotos } from "@/lib/filters";
import { CLUSTER_ZOOM, DEFAULT_MAP_ZOOM, overlayModeFromZoom, PIN_ZOOM } from "@/lib/zoom";
import type {
  CategoryColor,
  CategoryFilterKey,
  CountryId,
  OverlayMode,
  Photo,
  TimeFilter,
} from "@/types/album";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { MapRef } from "react-map-gl/maplibre";

export const COUNTRY_DOTS = Object.fromEntries(
  COUNTRIES.map((country) => [country.id, maskToDots(country)]),
) as Record<CountryId, ReturnType<typeof maskToDots>>;

type MapContextValue = {
  photos: Photo[];
  filteredPhotos: Photo[];
  selectedCountryId: CountryId;
  setSelectedCountryId: (id: CountryId) => void;
  mapRef: RefObject<MapRef | null>;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
  overlayMode: OverlayMode;
  zoomIn: () => void;
  zoomOut: () => void;
  flyToClusters: (lat: number, lng: number) => void;
  flyToPins: (lat: number, lng: number) => void;
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
  const mapRef = useRef<MapRef>(null);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [selectedCountryId, setSelectedCountryId] = useState<CountryId>("kr");
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
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

  const overlayMode = overlayModeFromZoom(mapZoom);

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

  const zoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 280 });
  }, []);

  const zoomOut = useCallback(() => {
    setSelectedPhotoId(null);
    mapRef.current?.zoomOut({ duration: 280 });
  }, []);

  const flyToClusters = useCallback((lat: number, lng: number) => {
    mapRef.current?.easeTo({
      center: [lng, lat],
      zoom: CLUSTER_ZOOM,
      duration: 650,
    });
  }, []);

  const flyToPins = useCallback((lat: number, lng: number) => {
    mapRef.current?.easeTo({
      center: [lng, lat],
      zoom: PIN_ZOOM,
      duration: 650,
    });
  }, []);

  const handleSelectCountry = useCallback(
    (id: CountryId) => {
      setSelectedCountryId(id);
      setSelectedPhotoId(null);
      setCountryModalOpen(false);
      const inCountry = photos.filter((photo) => photo.countryId === id);
      if (inCountry.length > 0) {
        setTimeFilter((prev) => ({ ...prev, year: latestPhotoYear(inCountry) }));
      }
      // 나라 전체 프레임으로 맞추되 maxZoom 5.4 → 항상 도트 레이어 구간에서 시작합니다.
      requestAnimationFrame(() => {
        mapRef.current?.fitBounds(countryBounds(id), {
          padding: 48,
          maxZoom: 5.4,
          duration: 900,
        });
      });
    },
    [photos],
  );

  const openPhoto = useCallback((id: string) => setSelectedPhotoId(id), []);
  const closePhoto = useCallback(() => setSelectedPhotoId(null), []);

  const value: MapContextValue = {
    photos,
    filteredPhotos,
    selectedCountryId,
    setSelectedCountryId: handleSelectCountry,
    mapRef,
    mapZoom,
    setMapZoom,
    overlayMode,
    zoomIn,
    zoomOut,
    flyToClusters,
    flyToPins,
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
