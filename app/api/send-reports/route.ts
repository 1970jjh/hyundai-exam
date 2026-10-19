// 개인 리포트 메일 일괄 발송 (Resend). 키가 없으면 501 → 화면에서 zip 다운로드로 대신한다.
import { personalReportHtml } from "@/lib/report";
import { rpc } from "@/lib/sb";
import { fail, HttpError, requireAdmin } from "@/lib/server";
import { computeStats } from "@/lib/stats";
import type { Results } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const pass = await requireAdmin(req);
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new HttpError(501, "메일 발송 키(RESEND_API_KEY)가 아직 설정되지 않았습니다");
    const from = process.env.RESEND_FROM ?? "온보딩 퀴즈 챌린지 <onboarding@resend.dev>";
    const { examId, attemptIds } = await req.json();
    const r = await rpc<Results>("hx_admin_results", { p: pass, p_id: examId });
    if (r.exam.status !== "ended") throw new HttpError(400, "시험이 종료된 뒤에 발송할 수 있습니다");
    const s = computeStats(r);
    const targets = r.attempts.filter((a) => a.email && (!attemptIds?.length || attemptIds.includes(a.id)));
    const sent: string[] = [];
    const failed: { name: string; error: string }[] = [];
    for (const a of targets) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [a.email], subject: `[${r.exam.title}] ${a.name}님의 평가 결과 리포트`, html: personalReportHtml(r, a.id, s) }),
      });
      if (res.ok) sent.push(a.id);
      else failed.push({ name: a.name, error: (await res.text()).slice(0, 200) });
      await new Promise((ok) => setTimeout(ok, 550)); // Resend 기본 초당 2건 제한
    }
    if (sent.length) await rpc("hx_admin_mark_emailed", { p: pass, p_ids: sent });
    return Response.json({ sent: sent.length, failed });
  } catch (e) {
    return fail(e);
  }
}
