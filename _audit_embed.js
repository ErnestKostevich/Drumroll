(function(){
  var ENDPOINT = "https://waitlistkit-three.vercel.app/api/embed/signup";
  var POWERED_HREF = "https://waitlistkit-three.vercel.app/";

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "style") n.setAttribute("style", attrs[k]);
      else if (k === "html") n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (children) for (var i=0;i<children.length;i++) {
      var c = children[i];
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return n;
  }

  var BTN_BG = "#34d399";
  var BTN_FG = "#04140d";
  var BG = "rgba(255,255,255,0.04)";
  var BORDER = "rgba(255,255,255,0.14)";
  var FG = "currentColor";

  function mount(host) {
    if (host.getAttribute("data-wk-mounted") === "1") return;
    host.setAttribute("data-wk-mounted", "1");

    var slug = host.getAttribute("data-waitlist");
    if (!slug) return;
    var refParam = new URLSearchParams(location.search).get("ref") || "";

    var input = el("input", {
      type: "email",
      placeholder: host.getAttribute("data-placeholder") || "you@startup.com",
      required: "required",
      autocomplete: "email",
      style: "flex:1;min-width:0;height:44px;padding:0 16px;border-radius:9999px;border:1px solid " + BORDER + ";background:" + BG + ";color:" + FG + ";font-size:14px;outline:none;font:inherit;"
    });

    var btn = el("button", {
      type: "submit",
      style: "height:44px;padding:0 20px;border-radius:9999px;border:0;background:" + BTN_BG + ";color:" + BTN_FG + ";font-weight:600;font-size:14px;cursor:pointer;white-space:nowrap;font:inherit;font-weight:600;"
    }, [host.getAttribute("data-cta") || "Join waitlist →"]);

    var status = el("p", { style: "margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.6);" });

    var form = el("form", {
      style: "display:flex;gap:8px;flex-wrap:wrap;align-items:stretch;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;"
    }, [input, btn]);

    var powered = el("a", {
      href: POWERED_HREF,
      target: "_blank",
      rel: "noreferrer",
      style: "margin-top:8px;display:inline-block;font-size:11px;color:rgba(255,255,255,0.45);text-decoration:none;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;"
    }, ["Powered by Drumroll"]);

    host.innerHTML = "";
    host.appendChild(form);
    host.appendChild(status);
    host.appendChild(powered);

    form.addEventListener("submit", function(e){
      e.preventDefault();
      btn.disabled = true;
      var orig = btn.textContent;
      btn.textContent = "…";
      status.textContent = "";

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: slug, email: input.value, ref: refParam })
      }).then(function(r){ return r.json().then(function(d){ return { ok: r.ok, data: d }; }); })
        .then(function(res){
          if (!res.ok || res.data.error) {
            status.textContent = res.data.error || "Something went wrong.";
            status.style.color = "#f87171";
          } else {
            host.innerHTML = "";
            var ok = el("div", { style: "padding:16px;border-radius:14px;border:1px solid rgba(52,211,153,0.4);background:rgba(52,211,153,0.1);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;" }, [
              el("p", { style: "margin:0;font-weight:600;font-size:15px;color:#34d399;" }, ["You're #" + res.data.position + " of " + res.data.total]),
              el("p", { style: "margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);" }, ["Share your link to move up. We'll email you when there's news."])
            ]);
            host.appendChild(ok);
          }
        })
        .catch(function(err){
          status.textContent = "Network error.";
          status.style.color = "#f87171";
        })
        .finally(function(){
          btn.disabled = false;
          btn.textContent = orig;
        });
    });
  }

  function init() {
    var hosts = document.querySelectorAll("[data-waitlist]");
    for (var i=0;i<hosts.length;i++) mount(hosts[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();