"use client";

/**
 * 지도 화면의 단일 진실 공급원.
 *
 * 흐름:
 *  photos → 국가/날짜/색 필터 → filteredPhotos
 *        → (줌 0~9.5) 육지 도트 격자 (밀도 = opacity)
 *        → (줌 9.5+) 흰 모노톤 상세 지도 + 묶음·개별 핀
 *
 * 줌은 Mapbox GL 인스턴스의 실제 zoom 입니다.
 * 휠/핀치는 연속으로 움직이고, 레이어 전환은 줌 9.5를 넘은 뒤 조작이 끝났을 때 1회만 합니다.
 */

import { COUNTRY_BY_ID } from "@/data/country-masks";
import { BUILTIN_KEY_CATEGORIES, dropBlackKeyCategories, fallbackBlackPhotoCategory, hexByCategoryList, isBlackKeyColor } from "@/lib/categories";
import { latestPhotoYear, MOCK_PHOTOS } from "@/data/mock-photos";
import { countryBounds } from "@/lib/density-dots";
import { filterPhotos } from "@/lib/filters";
import { sortPhotosByTakenAt, type AlbumSort } from "@/lib/album";
import {
  CLUSTER_ZOOM,
  COUNTRY_FIT_MAX_ZOOM,
  DEFAULT_MAP_ZOOM,
  overlayModeFromZoom,
  PIN_ZOOM,
} from "@/lib/zoom";
import type {
  CategoryColor,
  CategoryFilterKey,
  CountryId,
  KeyCategory,
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
import type { MapRef } from "react-map-gl/mapbox";

type MapContextValue = {
  photos: Photo[];
  filteredPhotos: Photo[];
  selectedCountryId: CountryId;
  setSelectedCountryId: (id: CountryId) => void;
  mapRef: RefObject<MapRef | null>;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
  overlayMode: OverlayMode;
  flyToClusters: (lat: number, lng: number) => void;
  flyToPins: (lat: number, lng: number) => void;
  selectedCategories: Set<CategoryFilterKey>;
  toggleCategory: (key: CategoryFilterKey) => void;
  keyCategories: KeyCategory[];
  addKeyCategory: (name: string, hex: string) => KeyCategory;
  removeKeyCategory: (id: string) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (next: TimeFilter) => void;
  selectedPhotoId: string | null;
  selectedPhoto: Photo | null;
  openPhoto: (id: string) => void;
  closePhoto: () => void;
  stepAlbumPhoto: (delta: -1 | 1) => void;
  albumPhotos: Photo[];
  albumSort: AlbumSort;
  setAlbumSort: (sort: AlbumSort) => void;
  albumIndex: number;
  albumCount: number;
  setPhotoCategory: (photoId: string, category: CategoryColor) => void;
  countryModalOpen: boolean;
  setCountryModalOpen: (open: boolean) => void;
};

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<MapRef>(null);
  const [photos, setPhotos] = useState<Photo[]>(() =>
    MOCK_PHOTOS.map((photo) => ({
      ...photo,
      category: fallbackBlackPhotoCategory(photo.category),
    })),
  );
  const [selectedCountryId, setSelectedCountryId] = useState<CountryId>("kr");
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [keyCategories, setKeyCategories] = useState<KeyCategory[]>(() =>
    dropBlackKeyCategories(BUILTIN_KEY_CATEGORIES),
  );
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
  const [albumSort, setAlbumSort] = useState<AlbumSort>("desc");

  const overlayMode = overlayModeFromZoom(mapZoom);

  const filteredPhotos = useMemo(
    () => filterPhotos(photos, selectedCountryId, timeFilter, selectedCategories),
    [photos, selectedCountryId, timeFilter, selectedCategories],
  );

  const albumPhotos = useMemo(() => sortPhotosByTakenAt(photos, albumSort), [photos, albumSort]);

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId],
  );

  const albumIndex = selectedPhotoId
    ? albumPhotos.findIndex((photo) => photo.id === selectedPhotoId)
    : -1;

  const toggleCategory = useCallback((key: CategoryFilterKey) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const addKeyCategory = useCallback((name: string, hex: string): KeyCategory => {
    const created: KeyCategory = {
      id: `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim() || "새 카테고리",
      hex,
    };
    if (isBlackKeyColor(hex)) return created;
    setKeyCategories((prev) => dropBlackKeyCategories([...prev, created]));
    return created;
  }, []);

  const removeKeyCategory = useCallback((id: string) => {
    setKeyCategories((prev) => prev.filter((item) => item.id !== id));
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPhotos((prev) =>
      prev.map((photo) => (photo.category === id ? { ...photo, category: null } : photo)),
    );
  }, []);

  const setPhotoCategory = useCallback((photoId: string, category: CategoryColor) => {
    const hexById = hexByCategoryList(keyCategories);
    const nextCategory = fallbackBlackPhotoCategory(category, hexById);
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, category: nextCategory } : photo)),
    );
  }, [keyCategories]);

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
      if (id !== "kr") return;
      setSelectedCountryId(id);
      setSelectedPhotoId(null);
      setCountryModalOpen(false);
      const inCountry = photos.filter((photo) => photo.countryId === id);
      if (inCountry.length > 0) {
        setTimeFilter((prev) => ({ ...prev, year: latestPhotoYear(inCountry) }));
      }
      requestAnimationFrame(() => {
        mapRef.current?.fitBounds(countryBounds(id), {
          padding: 48,
          maxZoom: COUNTRY_FIT_MAX_ZOOM,
          duration: 900,
        });
      });
    },
    [photos],
  );

  const openPhoto = useCallback((id: string) => setSelectedPhotoId(id), []);
  const closePhoto = useCallback(() => setSelectedPhotoId(null), []);

  const stepAlbumPhoto = useCallback(
    (delta: -1 | 1) => {
      setSelectedPhotoId((current) => {
        if (!current) return current;
        const index = albumPhotos.findIndex((photo) => photo.id === current);
        const next = albumPhotos[index + delta];
        return next?.id ?? current;
      });
    },
    [albumPhotos],
  );

  const value: MapContextValue = {
    photos,
    filteredPhotos,
    selectedCountryId,
    setSelectedCountryId: handleSelectCountry,
    mapRef,
    mapZoom,
    setMapZoom,
    overlayMode,
    flyToClusters,
    flyToPins,
    selectedCategories,
    toggleCategory,
    keyCategories,
    addKeyCategory,
    removeKeyCategory,
    timeFilter,
    setTimeFilter,
    selectedPhotoId,
    selectedPhoto,
    openPhoto,
    closePhoto,
    stepAlbumPhoto,
    albumPhotos,
    albumSort,
    setAlbumSort,
    albumIndex,
    albumCount: albumPhotos.length,
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
