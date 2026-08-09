import "server-only";

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function actionEmail(params: { eyebrow: string; title: string; body: string; action: string; url: string }) {
  const eyebrow = escapeHtml(params.eyebrow);
  const title = escapeHtml(params.title);
  const body = escapeHtml(params.body);
  const action = escapeHtml(params.action);
  const url = escapeHtml(params.url);
  return {
    html: `<div style="background:#f5f6fa;padding:36px 18px;font-family:Arial,sans-serif;color:#111827"><div style="max-width:560px;margin:auto;background:#fff;border-radius:24px;padding:32px"><div style="font-size:12px;font-weight:700;letter-spacing:.12em;color:#7657ff;text-transform:uppercase">${eyebrow}</div><h1 style="font-size:28px;line-height:1.2;margin:16px 0">${title}</h1><p style="font-size:15px;line-height:1.65;color:#64748b">${body}</p><a href="${url}" style="display:inline-block;margin-top:18px;background:#111827;color:#fff;text-decoration:none;border-radius:14px;padding:13px 20px;font-weight:700">${action}</a><p style="margin-top:24px;font-size:12px;line-height:1.5;color:#94a3b8">Se non hai richiesto questa operazione, ignora il messaggio.</p></div></div>`,
    text: `${params.title}\n\n${params.body}\n\n${params.action}: ${params.url}\n\nSe non hai richiesto questa operazione, ignora il messaggio.`,
  };
}

export function verificationEmail(name: string, url: string) {
  return actionEmail({ eyebrow: "Sicurezza account", title: `Verifica la tua email, ${name}`, body: "Conferma che questo indirizzo email appartenga a te per completare la registrazione a CasaHub.", action: "Verifica email", url });
}

export function passwordResetEmail(name: string, url: string) {
  return actionEmail({ eyebrow: "Recupero account", title: `Reimposta la password, ${name}`, body: "È stata richiesta una nuova password per il tuo account CasaHub. Il collegamento è personale e ha durata limitata.", action: "Scegli una nuova password", url });
}

export function invitationEmail(params: { inviterName: string; apartmentName: string; url: string }) {
  return actionEmail({ eyebrow: "Invito CasaHub", title: `${params.inviterName} ti ha invitato`, body: `Entra nello spazio “${params.apartmentName}” come inquilino per consultare scadenze, documenti, messaggi e segnalazioni.`, action: "Accetta l’invito", url: params.url });
}
