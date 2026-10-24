"""Monta o site do Level Up English a partir do código do app (pasta ../lue).
Copia os scripts trocando os textos que falam do Claude, cria o index.html completo,
o manifesto do app instalável e o service worker."""
import hashlib, json, os, re, shutil

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app-src")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
APP_JS = ["content.js", "core.js", "lesson.js", "ai.js", "social.js", "mascots.js", "duo.js", "views.js"]

REPL = {
    "ai.js": [("Entre de novo no Claude e recarregue a página.", "Entre na sua conta de novo e recarregue a página.")],
    "social.js": [("Recursos com amigos precisam do app aberto no Claude com sua conta.", "Recursos com amigos precisam de uma conta: vá em Meu Perfil e toque em Entrar.")],
    "views.js": [
        ("Sua conta é a mesma do Claude: o progresso fica salvo e sincroniza entre seus aparelhos.", "Você entrou com sua conta: o progresso fica salvo e sincroniza entre seus aparelhos."),
        ("O professor de IA só funciona com o app aberto no Claude. Nesta visualização ele está indisponível.", "A professora de IA precisa de uma conta. Vá em Meu Perfil e toque em Entrar."),
        ("Amigos, grupos e desafios online precisam do app aberto no Claude com sua conta.", "Amigos, grupos e desafios online precisam de uma conta. Vá em Meu Perfil e toque em Entrar."),
        ("Modo local: o ranking com outras pessoas aparece quando o app está aberto no Claude.", "Modo sem conta: o ranking com outras pessoas aparece quando você entra com uma conta."),
        ("Você entra com sua conta do Claude. Seu progresso é salvo na nuvem", "Você entrou com seu e-mail. Seu progresso é salvo na nuvem"),
        ("Modo local: o progresso está salvo só neste navegador. Abra o app no Claude para sincronizar.", "Modo sem conta: o progresso está salvo só neste aparelho. Entre com uma conta para salvar na nuvem."),
        ('return toast("Disponível com o app aberto no Claude.");', 'return toast("Disponível quando você entra com uma conta.");'),
    ],
}

HEAD = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Aprenda inglês alguns minutos por dia com lições curtas, mascotes, desafios com amigos e uma professora de IA.">
<meta name="theme-color" content="#3152F5">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Level Up">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;padding:0}img{max-width:100%}[hidden]{display:none!important}
.auth-wrap{min-height:90vh;display:grid;place-items:center;padding:24px max(16px,env(safe-area-inset-right,0px)) 24px max(16px,env(safe-area-inset-left,0px))}
.auth-card{width:100%;max-width:420px;background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:24px;box-shadow:var(--shadow);gap:14px}
.auth-card input{font-size:16px;width:100%;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);min-height:46px;box-sizing:border-box}
.auth-card h1{font-family:var(--display)}
.install-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:40;display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:16px;padding:10px 12px;width:min(92vw,460px)}
.install-bar img{width:40px;height:40px;border-radius:10px}
.install-bar p{flex:1;margin:0;font-size:.88rem;line-height:1.3}
@media (min-width:861px){.install-bar{bottom:20px}}
</style>
"""

INSTALL = """<script>
/* app instalável: registra o service worker e oferece "Instalar" */
(function () {
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  let seen = false; try { seen = !!localStorage.getItem("lue-install-dismissed"); } catch {}
  if (standalone || seen) return;
  let deferred = null;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  function bar(text, action) {
    if (document.querySelector(".install-bar")) return;
    const b = document.createElement("div"); b.className = "install-bar";
    b.innerHTML = '<img src="icons/icon-192.png" alt=""><p>' + text + '</p>' + (action ? '<button class="btn primary small" id="ib-go">Instalar</button>' : '') + '<button class="btn ghost small" id="ib-x" aria-label="Fechar">✕</button>';
    document.body.append(b);
    b.querySelector("#ib-x").onclick = () => { b.remove(); try { localStorage.setItem("lue-install-dismissed", "1"); } catch {} };
    if (action) b.querySelector("#ib-go").onclick = action;
  }
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferred = e;
    setTimeout(() => bar("Instale o Level Up English no seu celular para abrir com um toque.", async () => { deferred.prompt(); await deferred.userChoice.catch(() => {}); document.querySelector(".install-bar")?.remove(); }), 4000);
  });
  if (isIOS) setTimeout(() => bar("Para instalar: toque em Compartilhar e depois em \\u201cAdicionar à Tela de Início\\u201d."), 6000);
})();
</script>
"""


def build():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    for d in ("icons", "vendor"):
        shutil.copytree(os.path.join(os.path.dirname(os.path.abspath(__file__)), d), os.path.join(OUT, d))
    shutil.copy(os.path.join(os.path.dirname(os.path.abspath(__file__)), "platform.js"), OUT)
    for f in APP_JS:
        s = open(os.path.join(SRC, f), encoding="utf-8").read()
        for a, b in REPL.get(f, []):
            assert s.count(a) == 1, (f, a)
            s = s.replace(a, b)
        open(os.path.join(OUT, f), "w", encoding="utf-8").write(s)

    page = open(os.path.join(SRC, "index.html"), encoding="utf-8").read()
    title = re.search(r"<title>.*?</title>", page).group(0)
    page = page.replace(title, "").replace('<meta name="claude:viewport-fit-sides" content="cover">', "")
    head_extra, _, body = page.partition("</style>")
    scripts = '<script src="vendor/supabase.js"></script>\n<script src="platform.js"></script>\n'
    body = body.replace('<script src="content.js"></script>', scripts + '<script src="content.js"></script>', 1)
    html = HEAD + title + "\n" + head_extra.strip() + "\n</style>\n</head>\n<body>\n" + body.strip() + "\n" + INSTALL + "</body>\n</html>\n"
    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)

    manifest = {
        "name": "Level Up English", "short_name": "Level Up", "lang": "pt-BR",
        "description": "Aprenda inglês alguns minutos por dia.",
        "start_url": "./", "scope": "./", "display": "standalone", "orientation": "portrait",
        "background_color": "#F3F4FA", "theme_color": "#3152F5",
        "icons": [
            {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    json.dump(manifest, open(os.path.join(OUT, "manifest.webmanifest"), "w"), ensure_ascii=False, indent=2)

    files = sorted(p for p in os.listdir(OUT) if p.endswith((".js", ".html", ".webmanifest"))) + ["vendor/supabase.js"] + ["icons/" + i for i in sorted(os.listdir(os.path.join(OUT, "icons")))]
    h = hashlib.sha1(b"".join(open(os.path.join(OUT, f), "rb").read() for f in files)).hexdigest()[:10]
    shell = [f if f != "index.html" else "./" for f in files]
    sw = f"""/* Guarda o app no aparelho para abrir rápido e funcionar sem internet. */
const CACHE = "lue-{h}";
const SHELL = {json.dumps(shell)};
self.addEventListener("install", (e) => {{ e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); }});
self.addEventListener("activate", (e) => {{ e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); }});
self.addEventListener("fetch", (e) => {{
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (e.request.mode === "navigate") {{
    e.respondWith(fetch(e.request).then((r) => {{ const c = r.clone(); caches.open(CACHE).then((x) => x.put("./", c)); return r; }}).catch(() => caches.match("./")));
    return;
  }}
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
}});
"""
    open(os.path.join(OUT, "sw.js"), "w").write(sw)
    print("ok", h, len(files), "arquivos")


if __name__ == "__main__":
    build()
