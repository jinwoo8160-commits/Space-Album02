"use client";

import { ScenicPhoto } from "@/components/map/ScenicPhoto";
import {
  CapsuleButton,
  Chevron,
  IosSwitch,
  RowDivider,
  SectionLabel,
  SegmentedControl,
  SettingsCard,
  SettingsPageShell,
  SettingsRow,
} from "@/components/settings/settings-ui";
import { useMap } from "@/context/map-context";
import { formatTakenAt } from "@/lib/album";
import {
  MIN_ZOOM_SETTING_MAX,
  MIN_ZOOM_SETTING_MIN,
  snapStartFromMin,
} from "@/lib/zoom";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";

type Panel = "home" | "unlocated" | "export" | "restore" | "alerts" | "about";

export function SettingsScreen() {
  const { settings, updateSettings, photos } = useMap();
  const [panel, setPanel] = useState<Panel>("home");
  const [toast, setToast] = useState<string | null>(null);
  const unlocated = useMemo(() => photos.filter((photo) => photo.hasGps === false), [photos]);

  const notice = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  if (panel === "unlocated") {
    return (
      <SettingsPageShell title="위치 미지정 사진" onBack={() => setPanel("home")}>
        <p className="pb-4 text-[13px] leading-relaxed text-neutral-400">
          위치 값이 없는 사진입니다. 지금은 목록만 확인하고, 지도에 올리는 지정은 준비 중입니다.
        </p>
        {unlocated.length === 0 ? (
          <p className="pt-10 text-center text-sm text-neutral-500">위치 없는 사진이 없어요.</p>
        ) : (
          <SettingsCard>
            {unlocated.map((photo, index) => (
              <div key={photo.id}>
                {index > 0 ? <RowDivider /> : null}
                <button
                  type="button"
                  onClick={() => notice("위치 지정은 준비 중입니다")}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <ScenicPhoto scene={photo.scene} className="size-12 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-neutral-900">{photo.title}</p>
                    <p className="text-[12px] text-neutral-400">{formatTakenAt(photo.takenAt)}</p>
                  </div>
                  <Chevron />
                </button>
              </div>
            ))}
          </SettingsCard>
        )}
      </SettingsPageShell>
    );
  }

  if (panel === "export" || panel === "restore") {
    const exporting = panel === "export";
    return (
      <SettingsPageShell
        title={exporting ? "내보내기" : "복원하기"}
        onBack={() => setPanel("home")}
      >
        <p className="text-[13px] leading-relaxed text-neutral-400">
          {exporting
            ? "카테고리와 사진 메타데이터를 파일로 내보내는 기능은 준비 중입니다."
            : "백업 파일에서 카테고리와 사진 메타데이터를 되돌리는 기능은 준비 중입니다."}
        </p>
      </SettingsPageShell>
    );
  }

  if (panel === "alerts") {
    return (
      <SettingsPageShell title="알림 설정" onBack={() => setPanel("home")}>
        <p className="text-[16px] font-semibold text-neutral-900">알림 설정</p>
        <p className="pt-1 pb-5 text-[13px] leading-relaxed text-neutral-400">
          필요한 알림만 조용히 받아보세요.
        </p>
        <p className="text-[13px] text-neutral-400">푸시 알림</p>
        <p className="pt-1 pb-4 text-[13px] leading-relaxed text-neutral-400">
          실제 푸시는 꺼져 있어요. 아래 선택은 유지되지만 알림은 전달되지 않아요.
        </p>
        <CapsuleButton onClick={() => notice("시스템 알림 설정은 준비 중입니다")}>
          알림 권한 안내
        </CapsuleButton>

        <p className="px-1 pt-8 pb-2 text-[13px] text-neutral-400">받을 알림</p>
        <div>
          <SettingsRow
            title="매일 알림"
            description="매일 오전 9시"
            trailing={
              <IosSwitch
                label="매일 알림"
                checked={settings.dailyAlert}
                onCheckedChange={(next) => updateSettings({ dailyAlert: next })}
              />
            }
          />
          <RowDivider />
          <SettingsRow
            title="기록 결과 알림"
            description="오늘의 사진 · 새 지역"
            trailing={
              <IosSwitch
                label="기록 결과 알림"
                checked={settings.resultAlert}
                onCheckedChange={(next) => updateSettings({ resultAlert: next })}
              />
            }
          />
          <RowDivider />
          <SettingsRow
            title="상태 알림"
            description="위치 신호 · 일시 중지"
            trailing={
              <IosSwitch
                label="상태 알림"
                checked={settings.statusAlert}
                onCheckedChange={(next) => updateSettings({ statusAlert: next })}
              />
            }
          />
        </div>
      </SettingsPageShell>
    );
  }

  if (panel === "about") {
    return (
      <SettingsPageShell title="앱 정보" onBack={() => setPanel("home")}>
        <p className="text-[16px] font-semibold text-neutral-900">앱 정보</p>
        <p className="pt-3 text-[16px] text-neutral-800">버전 v1.0.0</p>
        <p className="pt-3 text-[16px] text-neutral-800">Nyeok.Co</p>
        <div className="flex flex-col gap-3 pt-8">
          <CapsuleButton onClick={() => notice("개인정보처리방침은 준비 중입니다")}>
            개인정보처리방침
          </CapsuleButton>
          <CapsuleButton onClick={() => notice("문의는 준비 중입니다")}>문의 및 피드백</CapsuleButton>
        </div>
        <p className="pt-10 text-[16px] font-semibold text-neutral-900">이용 중단 및 데이터 삭제</p>
        <p className="pt-3 text-[13px] leading-relaxed text-neutral-500">
          시공간 앨범은 로그인이나 온라인 회원 계정 없이 사용합니다. 이 기기에 둔 사진 위치와
          카테고리 색은 로컬 미리보기이며 서버에 저장하지 않아요. 이용을 중단하려면 앱을 삭제하면
          되고, 이 기기에 보이는 미리보기 데이터도 함께 사라집니다.
        </p>
        <p className="pt-3 text-[13px] leading-relaxed text-neutral-500">
          백업을 쓰지 않으면 앱을 지운 뒤 카테고리와 사진 분류는 복구되지 않습니다.
        </p>
      </SettingsPageShell>
    );
  }

  return (
    <section className="relative flex min-h-0 flex-1 flex-col bg-[#f4f4f5]">
      <header className="px-6 pt-6 pb-2">
        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">설정</h1>
        <p className="pt-1 text-[15px] text-neutral-400">지도 · 사진 · 보안</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28">
        <SectionLabel>지도 및 시각 효과</SectionLabel>
        <SettingsCard>
          <SettingsRow
            title="지도 스타일"
            description="라이트와 다크를 고르면 지도 탭에 바로 반영됩니다"
            trailing={
              <SegmentedControl
                value={settings.mapTheme}
                options={[
                  { value: "light", label: "라이트" },
                  { value: "dark", label: "다크" },
                ]}
                onChange={(value) => updateSettings({ mapTheme: value as "light" | "dark" })}
              />
            }
          />
          <RowDivider />
          <div className="py-3.5">
            <p className="text-[16px] font-semibold text-neutral-900">한반도 중앙 자동 정렬</p>
            <p className="pt-1 text-[12px] leading-snug text-neutral-400">
              스냅 줌 {settings.minZoom.toFixed(1)} · 자석 시작 {snapStartFromMin(settings.minZoom).toFixed(1)}
            </p>
            <input
              type="range"
              min={MIN_ZOOM_SETTING_MIN}
              max={MIN_ZOOM_SETTING_MAX}
              step={0.1}
              value={settings.minZoom}
              onChange={(event) => updateSettings({ minZoom: Number(event.target.value) })}
              className="mt-3 w-full accent-neutral-900"
              aria-label="스냅 트리거 줌"
            />
            <label className="mt-2 flex items-center justify-between gap-3 text-[13px] text-neutral-500">
              수치
              <input
                type="number"
                inputMode="decimal"
                min={MIN_ZOOM_SETTING_MIN}
                max={MIN_ZOOM_SETTING_MAX}
                step={0.1}
                value={settings.minZoom}
                onChange={(event) => updateSettings({ minZoom: Number(event.target.value) })}
                className="h-9 w-20 rounded-xl border border-white/80 bg-white text-center text-[14px] font-semibold text-neutral-900"
              />
            </label>
          </div>
          <RowDivider />
          <div className="grid grid-cols-2 gap-3 py-3.5">
            <label className="text-[13px] text-neutral-500">
              고정점 X (경도)
              <input
                type="number"
                inputMode="decimal"
                step={0.01}
                value={settings.homeLng}
                onChange={(event) => updateSettings({ homeLng: Number(event.target.value) })}
                className="mt-1.5 h-10 w-full rounded-xl border border-white/80 bg-white px-3 text-[14px] font-semibold text-neutral-900"
              />
            </label>
            <label className="text-[13px] text-neutral-500">
              고정점 Y (위도)
              <input
                type="number"
                inputMode="decimal"
                step={0.01}
                value={settings.homeLat}
                onChange={(event) => updateSettings({ homeLat: Number(event.target.value) })}
                className="mt-1.5 h-10 w-full rounded-xl border border-white/80 bg-white px-3 text-[14px] font-semibold text-neutral-900"
              />
            </label>
          </div>
        </SettingsCard>

        <SectionLabel>사진 및 데이터 관리</SectionLabel>
        <SettingsCard>
          <SettingsRow
            title="위치 미지정 사진"
            description="EXIF 위치가 없는 사진을 확인하고 지정합니다"
            trailing={
              <span className="flex items-center gap-1 text-[13px] text-neutral-400">
                {unlocated.length}
                <Chevron />
              </span>
            }
            onClick={() => setPanel("unlocated")}
          />
          <RowDivider />
          <div className="py-3.5">
            <p className="text-[16px] font-semibold text-neutral-900">지도 캐시 데이터</p>
            <p className="pt-1 text-[12px] leading-snug text-neutral-400">
              오프라인에서도 흰 도트 지도를 보려면 타일을 이 기기에 받아 둡니다. 실제 다운로드는
              연결하지 않고 상태만 보여 줍니다.
            </p>
            {settings.mapCacheReady ? (
              <div className="flex flex-col gap-2 pt-3">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-800">
                  <Check className="size-4 text-emerald-600" strokeWidth={2.4} />
                  저장됨
                </p>
                <CapsuleButton onClick={() => updateSettings({ mapCacheReady: false })}>
                  캐시 비우기
                </CapsuleButton>
              </div>
            ) : (
              <div className="pt-3">
                <CapsuleButton onClick={() => updateSettings({ mapCacheReady: true })}>
                  지도 데이터 다운로드
                </CapsuleButton>
              </div>
            )}
          </div>
          <RowDivider />
          <SettingsRow
            title="카테고리/사진 메타데이터 내보내기"
            trailing={<Chevron />}
            onClick={() => setPanel("export")}
          />
          <RowDivider />
          <SettingsRow title="복원하기" trailing={<Chevron />} onClick={() => setPanel("restore")} />
        </SettingsCard>

        <SectionLabel>보안 및 알림</SectionLabel>
        <SettingsCard>
          <SettingsRow
            title="PIN 잠금"
            description="앱을 열 때 4자리 PIN을 묻습니다"
            trailing={
              <IosSwitch
                label="PIN 잠금"
                checked={settings.pinLockEnabled}
                onCheckedChange={(next) => updateSettings({ pinLockEnabled: next })}
              />
            }
          />
          <RowDivider />
          <SettingsRow
            title="생체 인증"
            description="Face ID · 지문 UI만 표시합니다"
            trailing={
              <IosSwitch
                label="생체 인증"
                checked={settings.biometricEnabled}
                onCheckedChange={(next) => updateSettings({ biometricEnabled: next })}
              />
            }
          />
          <RowDivider />
          <SettingsRow
            title="매일 알림"
            trailing={
              <IosSwitch
                label="매일 알림"
                checked={settings.dailyAlert}
                onCheckedChange={(next) => updateSettings({ dailyAlert: next })}
              />
            }
          />
          <RowDivider />
          <SettingsRow
            title="상태 알림"
            trailing={
              <IosSwitch
                label="상태 알림"
                checked={settings.statusAlert}
                onCheckedChange={(next) => updateSettings({ statusAlert: next })}
              />
            }
          />
          <RowDivider />
          <SettingsRow title="알림 설정" trailing={<Chevron />} onClick={() => setPanel("alerts")} />
        </SettingsCard>

        <SectionLabel>앱 정보</SectionLabel>
        <SettingsCard>
          <SettingsRow title="앱 정보" trailing={<Chevron />} onClick={() => setPanel("about")} />
        </SettingsCard>
      </div>

      {toast ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-24 z-40 flex justify-center">
          <p className="rounded-full bg-neutral-900/92 px-3.5 py-2 text-[12px] text-white">{toast}</p>
        </div>
      ) : null}
    </section>
  );
}
