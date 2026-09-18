import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const LandingPageStyles = `
  :root {
    --bg:#09090B;
    --surface:#0E0F12;
    --surface-2:#131519;
    --line:rgba(255,255,255,.07);
    --line-strong:rgba(255,255,255,.14);
    --fg:#F3F2EF;
    --muted:rgba(243,242,239,.56);
    --faint:rgba(243,242,239,.34);
    --allow:#4E9E6A;
    --allow-lit:#6FD695;
    --ask:#C2913F;
    --ask-lit:#E6B65C;
    --block:#C4494E;
    --block-lit:#EE7176;
    --paper:#EFEDE7;
    --paper-fg:#16161A;
    --paper-line:rgba(22,22,26,.12);
    --sans:"Inter Tight",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
    --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    --pad:140px;
    --ease:cubic-bezier(.16,1,.3,1);
  }
  .heed-landing {
    background:var(--bg);
    color:var(--fg);
    font-family:var(--sans);
    font-size:15px;
    line-height:1.6;
    font-weight:400;
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
    min-height:100vh;
  }
  .heed-landing a {color:inherit;text-decoration:none}
  .heed-landing :focus-visible{outline:2px solid var(--allow-lit);outline-offset:3px;border-radius:2px}

  .heed-landing .wrap{width:100%;max-width:1160px;margin:0 auto;padding:0 28px}
  .heed-landing .band{padding:var(--pad) 0;border-top:1px solid var(--line)}
  .heed-landing .band:first-of-type{border-top:0}

  .heed-landing .eyebrow{
    font-family:var(--mono);font-size:11px;font-weight:400;
    letter-spacing:.12em;text-transform:uppercase;color:var(--faint);
    margin-bottom:34px;
  }
  .heed-landing h2{
    font-size:clamp(34px,5vw,58px);line-height:1.02;letter-spacing:-.03em;
    font-weight:500;max-width:17ch;
  }
  .heed-landing p{max-width:62ch;color:var(--muted);font-size:15px}
  .heed-landing .lede{color:var(--muted)}

  /* ── nav ─────────────────────────────────────── */
  .heed-landing header{
    position:sticky;top:0;z-index:60;
    border-bottom:1px solid transparent;
    transition:border-color .3s var(--ease),background .3s var(--ease);
  }
  .heed-landing header.stuck{border-bottom-color:var(--line);background:rgba(9,9,11,.82);backdrop-filter:blur(14px)}
  .heed-landing .nav{display:flex;align-items:center;justify-content:space-between;height:66px}
  .heed-landing .mark{font-family:var(--mono);font-size:14px;letter-spacing:.22em;font-weight:500}
  .heed-landing .nav-mid{display:flex;gap:30px;font-size:14px;color:var(--muted)}
  .heed-landing .nav-mid a:hover{color:var(--fg)}
  .heed-landing .pill{
    display:inline-block;background:var(--fg);color:#09090B;
    font-size:13px;font-weight:500;padding:7px 15px;border-radius:999px;
  }
  .heed-landing .pill:hover{background:#fff}

  /* ── hero ────────────────────────────────────── */
  .heed-landing .hero{padding-top:88px;padding-bottom:var(--pad);position:relative;overflow:hidden}
  .heed-landing .hero::before{
    content:"";position:absolute;inset:-10% -20% auto -20%;height:760px;
    background-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,.28) 1px,transparent 0);
    background-size:26px 26px;opacity:.03;pointer-events:none;
    -webkit-mask-image:linear-gradient(to bottom,#000,transparent 72%);
    mask-image:linear-gradient(to bottom,#000,transparent 72%);
  }
  .heed-landing .hero .wrap{position:relative}
  .heed-landing h1{
    font-size:clamp(40px,6.6vw,82px);line-height:.98;letter-spacing:-.035em;
    font-weight:500;max-width:15ch;
  }
  .heed-landing h1 .dim{color:var(--faint)}
  .heed-landing .hero p{margin-top:26px;max-width:55ch}
  .heed-landing .cta-row{display:flex;gap:10px;margin-top:34px;flex-wrap:wrap}
  .heed-landing .btn{font-size:14px;font-weight:500;padding:11px 20px;border-radius:8px;display:inline-block;transition:.2s var(--ease)}
  .heed-landing .btn-solid{background:var(--fg);color:#09090B}
  .heed-landing .btn-solid:hover{background:#fff}
  .heed-landing .btn-ghost{border:1px solid var(--line-strong);color:var(--muted)}
  .heed-landing .btn-ghost:hover{color:var(--fg);border-color:rgba(255,255,255,.3)}

  /* ── hero object ─────────────────────────────── */
  .heed-landing .stage{
    margin-top:76px;border:1px solid var(--line);border-radius:20px;
    background:linear-gradient(180deg,var(--surface),#0B0C0E);
    box-shadow:0 60px 120px -40px rgba(0,0,0,.9);
    display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);
  }
  .heed-landing .stage-l{padding:30px;border-right:1px solid var(--line)}
  .heed-landing .stage-r{padding:30px 30px 34px;display:flex;flex-direction:column;align-items:center}
  .heed-landing .k{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .heed-landing .objective{font-size:15px;line-height:1.45;margin-top:12px;letter-spacing:-.01em;min-height:66px}

  .heed-landing .traj{margin-top:30px;list-style:none}
  .heed-landing .traj li{
    font-family:var(--mono);font-size:12px;color:var(--faint);
    padding:5px 0 5px 20px;position:relative;
    transition:color .4s var(--ease);
  }
  .heed-landing .traj li::before{
    content:"";position:absolute;left:4px;top:13px;width:5px;height:5px;border-radius:50%;
    background:var(--line-strong);
  }
  .heed-landing .traj li::after{
    content:"";position:absolute;left:6.2px;top:19px;height:12px;width:1px;background:var(--line);
  }
  .heed-landing .traj li:last-child::after{display:none}
  .heed-landing .traj li.on{color:var(--muted)}

  .heed-landing .payload{
    margin-top:30px;border:1px solid var(--line);border-radius:10px;
    background:#0A0B0D;padding:14px 15px;font-family:var(--mono);font-size:11.5px;line-height:1.85;
  }
  .heed-landing .payload .kk{color:var(--faint)}
  .heed-landing .payload .vv{color:var(--fg)}
  .heed-landing .payload .cap{color:var(--muted)}

  /* flow */
  .heed-landing .flow{width:100%;max-width:380px;display:flex;flex-direction:column;align-items:center}
  .heed-landing .node{
    width:100%;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);
    padding:13px 16px;text-align:center;
    font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;
    color:var(--faint);transition:.45s var(--ease);
  }
  .heed-landing .node.lit{color:var(--fg);border-color:var(--line-strong);background:#181B20}
  .heed-landing .node.heed{letter-spacing:.24em}
  .heed-landing .node.heed.lit{box-shadow:0 0 0 1px rgba(255,255,255,.08),0 20px 50px -24px rgba(255,255,255,.22)}
  .heed-landing .ctx{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:11px}
  .heed-landing .ctx span{
    font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;
    border:1px solid var(--line);border-radius:4px;padding:2px 6px;color:var(--faint);
    transition:.45s var(--ease);
  }
  .heed-landing .heed.lit .ctx span{color:var(--muted);border-color:var(--line-strong)}

  .heed-landing .seg{width:1px;height:34px;background:var(--line);position:relative;overflow:hidden}
  .heed-landing .seg i{
    position:absolute;left:0;top:0;width:1px;height:100%;
    background:linear-gradient(180deg,transparent,var(--fg));
    transform:scaleY(0);transform-origin:top;
    transition:transform .55s var(--ease);
  }
  .heed-landing .seg.run i{transform:scaleY(1)}
  .heed-landing .seg.halt{background:transparent}

  .heed-landing .verdicts{display:flex;gap:7px;width:100%}
  .heed-landing .v{
    flex:1;border:1px solid var(--line);border-radius:8px;padding:10px 4px;text-align:center;
    font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--faint);
    transition:.35s var(--ease);
  }
  .heed-landing .v[data-v="ALLOW"].on{color:var(--allow-lit);border-color:rgba(111,214,149,.45);background:rgba(78,158,106,.1)}
  .heed-landing .v[data-v="ASK"].on{color:var(--ask-lit);border-color:rgba(230,182,92,.45);background:rgba(194,145,63,.1)}
  .heed-landing .v[data-v="BLOCK"].on{color:var(--block-lit);border-color:rgba(238,113,118,.45);background:rgba(196,73,78,.1)}

  .heed-landing .stop{width:100%;height:1px;background:var(--block);opacity:0;transition:opacity .35s var(--ease)}
  .heed-landing .stop.on{opacity:1}
  .heed-landing .dest{width:100%;text-align:center;transition:.45s var(--ease)}
  .heed-landing .note{
    font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;
    color:var(--faint);margin-top:12px;min-height:16px;transition:color .4s var(--ease);
  }
  .heed-landing .note.block{color:var(--block-lit)}
  .heed-landing .note.ask{color:var(--ask-lit)}
  .heed-landing .note.allow{color:var(--allow-lit)}

  /* ── the gap ─────────────────────────────────── */
  .heed-landing .two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:72px;align-items:start}
  .heed-landing .tree{font-family:var(--mono);font-size:12.5px;line-height:2;color:var(--faint);white-space:pre}
  .heed-landing .tree b{color:var(--muted);font-weight:400}
  .heed-landing .ask-q{margin-top:34px;font-size:22px;letter-spacing:-.02em;color:var(--muted);max-width:24ch;line-height:1.3}
  .heed-landing .ask-a{margin-top:10px;font-size:22px;letter-spacing:-.02em;color:var(--fg);line-height:1.3}

  /* ── trajectory ──────────────────────────────── */
  .heed-landing .exec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:56px}
  .heed-landing .exec{border:1px solid var(--line);border-radius:16px;background:var(--surface);padding:26px}
  .heed-landing .exec h3{font-size:15px;font-weight:400;letter-spacing:-.01em;margin-top:10px;color:var(--fg);min-height:44px}
  .heed-landing .chain{list-style:none;margin-top:24px}
  .heed-landing .chain li{
    font-family:var(--mono);font-size:12px;color:var(--faint);
    border:1px solid var(--line);border-radius:7px;padding:9px 12px;margin-bottom:6px;
  }
  .heed-landing .chain li.final{color:var(--fg);border-color:var(--line-strong);background:var(--surface-2)}
  .heed-landing .chain li.arrow{border:0;padding:0 0 0 12px;color:var(--line-strong);margin:0}
  .heed-landing .verdict-line{
    margin-top:18px;font-family:var(--mono);font-size:12px;letter-spacing:.14em;
    padding-top:16px;border-top:1px solid var(--line);
  }
  .heed-landing .verdict-line.a{color:var(--allow-lit)}
  .heed-landing .verdict-line.b{color:var(--block-lit)}
  .heed-landing .reasons{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
  .heed-landing .reasons span{font-family:var(--mono);font-size:10px;letter-spacing:.06em;color:var(--faint);border:1px solid var(--line);border-radius:4px;padding:3px 7px}

  /* ── decisions ───────────────────────────────── */
  .heed-landing .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:56px}
  .heed-landing .card{border:1px solid var(--line);border-radius:14px;padding:26px;background:var(--surface)}
  .heed-landing .card .t{font-family:var(--mono);font-size:12px;letter-spacing:.2em;margin-bottom:16px}
  .heed-landing .card p{font-size:14px;max-width:34ch}
  .heed-landing .card.allow{border-color:rgba(78,158,106,.3);background:linear-gradient(180deg,rgba(78,158,106,.07),transparent 70%)}
  .heed-landing .card.allow .t{color:var(--allow-lit)}
  .heed-landing .card.ask{border-color:rgba(194,145,63,.3);background:linear-gradient(180deg,rgba(194,145,63,.07),transparent 70%)}
  .heed-landing .card.ask .t{color:var(--ask-lit)}
  .heed-landing .card.block{border-color:rgba(196,73,78,.3);background:linear-gradient(180deg,rgba(196,73,78,.07),transparent 70%)}
  .heed-landing .card.block .t{color:var(--block-lit)}

  /* ── adoption ────────────────────────────────── */
  .heed-landing .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:56px;border-top:1px solid var(--line)}
  .heed-landing .step{padding:26px 24px 0 0;border-right:1px solid var(--line);position:relative}
  .heed-landing .step:last-child{border-right:0}
  .heed-landing .step .n{font-family:var(--mono);font-size:11px;color:var(--faint);letter-spacing:.1em}
  .heed-landing .step h4{font-size:17px;font-weight:500;letter-spacing:-.02em;margin:12px 0 8px}
  .heed-landing .step p{font-size:14px;max-width:26ch}
  .heed-landing .step::before{content:"";position:absolute;top:-1px;left:0;width:38px;height:1px;background:var(--fg)}

  /* ── control plane (paper) ───────────────────── */
  .heed-landing .paper{background:var(--paper);color:var(--paper-fg);overflow:hidden;border-top:0}
  .heed-landing .paper .eyebrow{color:rgba(22,22,26,.4)}
  .heed-landing .paper p{color:rgba(22,22,26,.62)}
  .heed-landing .paper h2{color:var(--paper-fg)}
  .heed-landing .cp-grid{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:64px;align-items:center}
  .heed-landing .cp-frame{
    border-radius:14px;border:1px solid var(--paper-line);background:#fff;
    box-shadow:0 70px 110px -50px rgba(22,22,26,.45),0 12px 30px -18px rgba(22,22,26,.2);
    transform:perspective(1800px) rotateY(-7deg) rotateX(1.5deg);
    transform-origin:left center;
    width:calc(100% + 190px);overflow:hidden;
  }
  .heed-landing .cp-bar{display:flex;align-items:center;gap:7px;padding:11px 14px;border-bottom:1px solid var(--paper-line)}
  .heed-landing .cp-bar i{width:8px;height:8px;border-radius:50%;background:rgba(22,22,26,.13)}
  .heed-landing .cp-bar span{font-family:var(--mono);font-size:10.5px;color:rgba(22,22,26,.42);margin-left:8px;letter-spacing:.04em}
  .heed-landing .cp-body{display:grid;grid-template-columns:1fr 200px}
  .heed-landing .cp-main{padding:18px 20px;border-right:1px solid var(--paper-line)}
  .heed-landing .cp-h{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(22,22,26,.4)}
  .heed-landing .cp-obj{font-size:13.5px;margin:8px 0 18px;letter-spacing:-.01em}
  .heed-landing .cp-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--paper-line);font-family:var(--mono);font-size:11px}
  .heed-landing .cp-row .cap{color:rgba(22,22,26,.75);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .heed-landing .cp-row .vd{font-size:10px;letter-spacing:.1em;padding:2px 7px;border-radius:4px}
  .heed-landing .vd.a{color:#2E6B45;background:rgba(78,158,106,.16)}
  .heed-landing .vd.k{color:#8A6420;background:rgba(194,145,63,.18)}
  .heed-landing .vd.b{color:#9C2F33;background:rgba(196,73,78,.14)}
  .heed-landing .cp-chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:14px}
  .heed-landing .cp-chips span{font-family:var(--mono);font-size:9.5px;letter-spacing:.05em;border:1px solid var(--paper-line);border-radius:4px;padding:3px 6px;color:rgba(22,22,26,.55)}
  .heed-landing .cp-side{padding:18px 16px}
  .heed-landing .g-node{font-family:var(--mono);font-size:10px;border:1px solid var(--paper-line);border-radius:5px;padding:6px 8px;color:rgba(22,22,26,.6);text-align:center}
  .heed-landing .g-node.stop{border-color:rgba(196,73,78,.5);color:#9C2F33}
  .heed-landing .g-line{width:1px;height:14px;background:var(--paper-line);margin:0 auto}

  /* ── integration ─────────────────────────────── */
  .heed-landing .code{
    margin-top:48px;border:1px solid var(--line);border-radius:14px;background:#0A0B0D;
    font-family:var(--mono);font-size:13px;line-height:1.95;overflow-x:auto;
  }
  .heed-landing .code-top{padding:11px 18px;border-bottom:1px solid var(--line);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
  .heed-landing .code pre{padding:22px 24px;color:var(--muted);white-space:pre; margin: 0;}
  .heed-landing .c-key{color:#9A8FE0}
  .heed-landing .c-str{color:var(--allow-lit)}
  .heed-landing .c-fn{color:var(--fg)}
  .heed-landing .c-prop{color:#C9C7E8}
  .heed-landing .c-com{color:var(--faint)}

  /* ── honesty ─────────────────────────────────── */
  .heed-landing .not{list-style:none;margin-top:44px;border-top:1px solid var(--line)}
  .heed-landing .not li{
    font-family:var(--mono);font-size:12.5px;color:var(--faint);
    padding:13px 0;border-bottom:1px solid var(--line);
    display:flex;gap:16px;align-items:baseline;
  }
  .heed-landing .not li em{font-style:normal;color:rgba(243,242,239,.2);font-size:11px;letter-spacing:.1em}

  /* ── cta + footer ────────────────────────────── */
  .heed-landing .cta{text-align:left}
  .heed-landing .form{display:flex;gap:8px;margin-top:34px;max-width:430px}
  .heed-landing .form input{
    flex:1;background:transparent;border:1px solid var(--line-strong);border-radius:8px;
    padding:11px 14px;color:var(--fg);font-family:var(--sans);font-size:14px;
  }
  .heed-landing .form input::placeholder{color:var(--faint)}
  .heed-landing .form input:focus{border-color:rgba(255,255,255,.35);outline:none}
  .heed-landing footer{border-top:1px solid var(--line);padding:46px 0 60px}
  .heed-landing .foot{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:28px}
  .heed-landing .foot h5{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);font-weight:400;margin-bottom:14px}
  .heed-landing .foot a{display:block;font-family:var(--mono);font-size:12px;color:var(--muted);padding:4px 0}
  .heed-landing .foot a:hover{color:var(--fg)}
  .heed-landing .foot .mark{margin-bottom:12px}
  .heed-landing .foot .tag{font-size:12.5px;color:var(--faint);max-width:30ch}

  /* ── reveal ──────────────────────────────────── */
  .heed-landing .rv{opacity:0;transform:translateY(8px);transition:opacity .5s var(--ease),transform .5s var(--ease)}
  .heed-landing .rv.in{opacity:1;transform:none}

  /* ── responsive ──────────────────────────────── */
  @media(max-width:980px){
    :root{--pad:88px}
    .heed-landing .stage{grid-template-columns:1fr}
    .heed-landing .stage-l{border-right:0;border-bottom:1px solid var(--line)}
    .heed-landing .two{grid-template-columns:1fr;gap:44px}
    .heed-landing .cards{grid-template-columns:1fr}
    .heed-landing .steps{grid-template-columns:1fr 1fr}
    .heed-landing .step{border-bottom:1px solid var(--line);padding-bottom:24px;margin-bottom:24px}
    .heed-landing .step:nth-child(2){border-right:0}
    .heed-landing .cp-grid{grid-template-columns:1fr;gap:44px}
    .heed-landing .cp-frame{transform:none;width:100%}
    .heed-landing .exec-grid{grid-template-columns:1fr}
    .heed-landing .foot{grid-template-columns:1fr 1fr}
  }
  @media(max-width:620px){
    :root{--pad:76px}
    .heed-landing .wrap{padding:0 20px}
    .heed-landing .nav-mid{display:none}
    .heed-landing .hero{padding-top:56px}
    .heed-landing .steps{grid-template-columns:1fr}
    .heed-landing .step{border-right:0}
    .heed-landing .cp-body{grid-template-columns:1fr}
    .heed-landing .cp-main{border-right:0;border-bottom:1px solid var(--paper-line)}
    .heed-landing .stage-l,.heed-landing .stage-r{padding:22px}
  }
  @media(prefers-reduced-motion:reduce){
    .heed-landing *{animation:none!important;transition-duration:.01ms!important}
    .heed-landing .rv{opacity:1;transform:none}
    .heed-landing .seg i{transform:scaleY(1)}
  }
`;

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // reveal
    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && containerRef.current) {
      io = new IntersectionObserver((es) => {
        es.forEach(e => { 
          if(e.isIntersecting){ 
            e.target.classList.add('in'); 
            io!.unobserve(e.target); 
          } 
        });
      }, {threshold:.12, rootMargin:'0px 0px -40px'});
      
      const rvs = containerRef.current.querySelectorAll('.rv');
      rvs.forEach((el, i) => {
        (el as HTMLElement).style.transitionDelay = (Math.min(i, 6) * 40) + 'ms';
        io!.observe(el);
      });
    } else if (containerRef.current) {
      containerRef.current.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
    }

    // hero object animation
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scenarios = [
      {
        objective:'Summarize open issues in the repository.',
        traj:['repository.read','issue.read','issue.analyze'],
        action:{system:'github',operation:'read_file',resource:'src/index.ts',capability:'repository.read'},
        verdict:'ALLOW', dest:'External system · github', note:'connector executed'
      },
      {
        objective:'Notify the on-call channel about incident 4412.',
        traj:['incident.read','incident.analyze','notification.prepare'],
        action:{system:'http',operation:'POST',resource:'webhook/on-call',capability:'external_network.write'},
        verdict:'ASK', dest:'Human decision · allow once / block / terminate', note:'execution paused'
      },
      {
        objective:'Summarize open issues in the repository.',
        traj:['repository.read','issue.read','issue.analyze'],
        action:{system:'github',operation:'read_file',resource:'production/secrets.env',capability:'credential.read'},
        verdict:'BLOCK', dest:'External system', note:'connector never executed'
      }
    ];

    const el = {
      objective: document.getElementById('objective'),
      traj: document.getElementById('traj'),
      payload: document.getElementById('payload'),
      agent: document.getElementById('n-agent'),
      heed: document.getElementById('n-heed'),
      dest: document.getElementById('n-dest'),
      note: document.getElementById('note'),
      stop: document.getElementById('stop'),
      s1: document.getElementById('s1'),
      s2: document.getElementById('s2'),
      s3: document.getElementById('s3'),
      vs: document.querySelectorAll('.v')
    };

    const esc = (s: string) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

    const paint = (s: any) => {
      if (!el.objective) return;
      el.objective.textContent = s.objective;
      el.traj!.innerHTML = s.traj.map((t: string) => '<li class="on">'+esc(t)+'</li>').join('')
        + '<li>'+esc(s.action.capability)+'</li>';
      el.payload!.innerHTML =
        '<span class="kk">{</span><br>'+
        '&nbsp;&nbsp;<span class="kk">system:</span> <span class="vv">"'+esc(s.action.system)+'"</span>,<br>'+
        '&nbsp;&nbsp;<span class="kk">operation:</span> <span class="vv">"'+esc(s.action.operation)+'"</span>,<br>'+
        '&nbsp;&nbsp;<span class="kk">resource:</span> <span class="vv">"'+esc(s.action.resource)+'"</span>,<br>'+
        '&nbsp;&nbsp;<span class="kk">capability:</span> <span class="cap">"'+esc(s.action.capability)+'"</span><br>'+
        '<span class="kk">}</span>';
    };

    const reset = () => {
      if (!el.s1) return;
      el.s1.classList.remove('run'); el.s2!.classList.remove('run'); el.s3!.classList.remove('run','halt');
      el.agent!.classList.remove('lit'); el.heed!.classList.remove('lit'); el.dest!.classList.remove('lit');
      el.stop!.classList.remove('on');
      el.note!.textContent = ''; el.note!.className = 'note';
      el.vs.forEach(v => v.classList.remove('on'));
      el.dest!.textContent = 'External system';
    };

    let timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, ms)); };
    const clear = () => { timers.forEach(clearTimeout); timers = []; };

    let i = 0;
    let isActive = true;

    const run = () => {
      if (!isActive || !el.objective) return;
      clear(); reset();
      const s = scenarios[i % scenarios.length];
      paint(s);

      const t = reduce ? 0 : 1;
      at(120*t, () => { el.agent!.classList.add('lit'); });
      at(380*t, () => { el.s1!.classList.add('run'); });
      at(980*t, () => { el.heed!.classList.add('lit'); });
      at(1560*t, () => {
        el.s2!.classList.add('run');
        const verdictEl = document.querySelector('.v[data-v="'+s.verdict+'"]');
        if (verdictEl) verdictEl.classList.add('on');
      });
      at(2200*t, () => {
        if (s.verdict === 'BLOCK') {
          el.s3!.classList.add('halt');
          el.stop!.classList.add('on');
        } else {
          el.s3!.classList.add('run');
        }
      });
      at(2700*t, () => {
        el.dest!.textContent = s.dest;
        if (s.verdict !== 'BLOCK') el.dest!.classList.add('lit');
        el.note!.textContent = s.note;
        el.note!.className = 'note ' + s.verdict.toLowerCase();
      });

      i++;
      at(reduce ? 5200 : 4600, run);
    };

    if (el.objective) {
      run();
    }

    return () => {
      if (io) io.disconnect();
      isActive = false;
      clear();
    };
  }, []);

  return (
    <div className="heed-landing" ref={containerRef}>
      <style>{LandingPageStyles}</style>

      {/* 01 HERO */}
      <section className="hero band">
        <div className="wrap">
          <p className="eyebrow rv">[ 01 — RUNTIME ]</p>
          <h1 className="rv">Your agent decides what it wants to do.<br/><span className="dim">HEED decides whether it happens.</span></h1>
          <p className="rv">A runtime control layer that evaluates every consequential action against the execution it belongs to, before it reaches an external system.</p>
          <div className="cta-row rv">
            <Link to="/app" className="btn btn-solid">Get access</Link>
            <a href="#integration" className="btn btn-ghost">Read the docs</a>
          </div>

          <div className="stage rv" id="stage">
            <div className="stage-l">
              <div className="k">Objective</div>
              <div className="objective" id="objective"></div>
              <div className="k" style={{marginTop: '6px'}}>Trajectory</div>
              <ul className="traj" id="traj"></ul>
              <div className="payload" id="payload"></div>
            </div>

            <div className="stage-r">
              <div className="flow">
                <div className="node" id="n-agent">AI agent</div>
                <div className="seg" id="s1"><i></i></div>
                <div className="node heed" id="n-heed">
                  HEED
                  <div className="ctx">
                    <span>objective</span><span>contract</span><span>capability</span><span>resource</span><span>trajectory</span>
                  </div>
                </div>
                <div className="seg" id="s2"><i></i></div>
                <div className="verdicts">
                  <div className="v" data-v="ALLOW">ALLOW</div>
                  <div className="v" data-v="ASK">ASK</div>
                  <div className="v" data-v="BLOCK">BLOCK</div>
                </div>
                <div className="seg" id="s3"><i></i></div>
                <div className="stop" id="stop"></div>
                <div className="node dest" id="n-dest">External system</div>
                <div className="note" id="note"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 THE GAP */}
      <section className="band">
        <div className="wrap two">
          <div className="rv">
            <p className="eyebrow">[ 02 — THE GAP ]</p>
            <div className="tree">agent
      ├── <b>repository.read</b>
      ├── <b>repository.write</b>
      └── <b>external_network.write</b></div>
            <div className="ask-q">Can the agent perform this action?</div>
            <div className="ask-a">But should it, in this execution?</div>
          </div>
          <div className="rv" style={{paddingTop: '38px'}}>
            <p>Permissions are granted before an execution begins. They describe the range of things an agent may do across every task it will ever run. They cannot describe the task it is running right now.</p>
            <p style={{marginTop: '18px'}}>An action can be fully permitted and still be wrong for the objective it appears under.</p>
          </div>
        </div>
      </section>

      {/* 03 TRAJECTORY */}
      <section className="band" id="trajectory">
        <div className="wrap">
          <p className="eyebrow rv">[ 03 — TRAJECTORY ]</p>
          <h2 className="rv">The same action, decided twice.</h2>
          <div className="exec-grid">
            <div className="exec rv">
              <div className="k">Execution A</div>
              <h3>Send the approved incident notification to the on-call channel.</h3>
              <ul className="chain">
                <li>incident.read</li>
                <li className="arrow">│</li>
                <li>incident.analyze</li>
                <li className="arrow">│</li>
                <li>notification.prepare</li>
                <li className="arrow">│</li>
                <li className="final">external_network.write → webhook</li>
              </ul>
              <div className="verdict-line a">ALLOW</div>
            </div>
            <div className="exec rv">
              <div className="k">Execution B</div>
              <h3>Summarize the incident internally for the engineering log.</h3>
              <ul className="chain">
                <li>incident.read</li>
                <li className="arrow">│</li>
                <li>incident.analyze</li>
                <li className="arrow">│</li>
                <li>credential.read → production/secrets.env</li>
                <li className="arrow">│</li>
                <li className="final">external_network.write → webhook</li>
              </ul>
              <div className="verdict-line b">BLOCK</div>
              <div className="reasons"><span>CAPABILITY_ESCALATION</span><span>OBJECTIVE_DEVIATION</span></div>
            </div>
          </div>
          <p className="rv" style={{marginTop: '32px'}}>The action is identical. The execution is not.</p>
        </div>
      </section>

      {/* 04 DECISIONS */}
      <section className="band">
        <div className="wrap">
          <p className="eyebrow rv">[ 04 — DECISIONS ]</p>
          <h2 className="rv">Three outcomes at the boundary.</h2>
          <div className="cards">
            <div className="card allow rv"><div className="t">ALLOW</div><p>The action fits the execution. It reaches the connector unchanged and the agent continues.</p></div>
            <div className="card ask rv"><div className="t">ASK</div><p>Execution pauses for a human: allow once, block, or terminate. On approval it resumes from where it stopped.</p></div>
            <div className="card block rv"><div className="t">BLOCK</div><p>The action stops before the connector. Zero connector side effects — the invariant the test suite verifies.</p></div>
          </div>
        </div>
      </section>

      {/* 05 ADOPTION */}
      <section className="band" id="adoption">
        <div className="wrap">
          <p className="eyebrow rv">[ 05 — ADOPTION ]</p>
          <h2 className="rv">Observe first. Enforce when you are ready.</h2>
          <div className="steps">
            <div className="step rv"><div className="n">01</div><h4>Install</h4><p>Wrap the actions that touch the outside world.</p></div>
            <div className="step rv"><div className="n">02</div><h4>Observe</h4><p>HEED records what it would have decided. Agent behavior is unchanged.</p></div>
            <div className="step rv"><div className="n">03</div><h4>Tune</h4><p>Set the objective, the action budget, and the external-write limit.</p></div>
            <div className="step rv"><div className="n">04</div><h4>Enforce</h4><p>Decisions now stop or pause actions before side effects.</p></div>
          </div>
        </div>
      </section>

      {/* 06 CONTROL PLANE */}
      <section className="band paper">
        <div className="wrap cp-grid">
          <div className="rv">
            <p className="eyebrow">[ 06 — CONTROL PLANE ]</p>
            <h2>Evidence, not guesswork.</h2>
            <p style={{marginTop: '24px'}}>Every execution persists as a timeline: what was attempted, what was decided, and the reasons behind it. Sensitive values are redacted before they are stored.</p>
          </div>
          <div className="rv">
            <div className="cp-frame">
              <div className="cp-bar"><i></i><i></i><i></i><span>heed.dev/executions/exec_8f21c4</span></div>
              <div className="cp-body">
                <div className="cp-main">
                  <div className="cp-h">Objective</div>
                  <div className="cp-obj">Summarize open issues in the repository.</div>
                  <div className="cp-h">Action timeline</div>
                  <div className="cp-row"><span className="cap">repository.read · src/index.ts</span><span className="vd a">ALLOW</span></div>
                  <div className="cp-row"><span className="cap">issue.read · repo/issues</span><span className="vd a">ALLOW</span></div>
                  <div className="cp-row"><span className="cap">issue.analyze · repo/issues</span><span className="vd a">ALLOW</span></div>
                  <div className="cp-row"><span className="cap">credential.read · production/secrets.env</span><span className="vd b">BLOCK</span></div>
                  <div className="cp-chips"><span>CAPABILITY_ESCALATION</span><span>OBJECTIVE_DEVIATION</span><span>token: [REDACTED]</span></div>
                </div>
                <div className="cp-side">
                  <div className="cp-h" style={{marginBottom: '12px'}}>Graph</div>
                  <div className="g-node">repository.read</div><div className="g-line"></div>
                  <div className="g-node">issue.read</div><div className="g-line"></div>
                  <div className="g-node">issue.analyze</div><div className="g-line"></div>
                  <div className="g-node stop">credential.read — blocked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07 INTEGRATION */}
      <section className="band" id="integration">
        <div className="wrap">
          <p className="eyebrow rv">[ 07 — INTEGRATION ]</p>
          <h2 className="rv">Four lines at the boundary.</h2>
          <p className="rv" style={{marginTop: '22px'}}>The decision engine, trajectory evaluator, and event store stay behind the SDK. You describe the action; HEED returns the decision or throws.</p>
          <div className="code rv">
            <div className="code-top">@heed/runtime</div>
            <pre><span className="c-key">import</span> {'{'} Heed {'}'} <span className="c-key">from</span> <span className="c-str">"@heed/runtime"</span>;

<span className="c-key">const</span> heed = <span className="c-key">new</span> <span className="c-fn">Heed</span>({'{'} runtimeUrl, agentId, apiKey {'}'});

<span className="c-key">await</span> heed.<span className="c-fn">execute</span>({'{'}
  <span className="c-prop">system</span>:     <span className="c-str">"github"</span>,
  <span className="c-prop">operation</span>:  <span className="c-str">"read_file"</span>,
  <span className="c-prop">resource</span>:   <span className="c-str">"production/secrets.env"</span>,
  <span className="c-prop">capability</span>: <span className="c-str">"credential.read"</span>
{'}'}); <span className="c-com">// throws HeedError on BLOCK — connector never runs</span></pre>
          </div>
        </div>
      </section>

      {/* 08 HONESTY */}
      <section className="band">
        <div className="wrap">
          <p className="eyebrow rv">[ 08 — SCOPE ]</p>
          <h2 className="rv">What HEED is not, yet.</h2>
          <ul className="not rv">
            <li><em>NOT</em> an enterprise IAM platform</li>
            <li><em>NOT</em> a credential vault</li>
            <li><em>NOT</em> an autonomous AI security analyst</li>
            <li><em>NOT</em> a machine-learning anomaly detection platform</li>
            <li><em>NOT</em> a plug-and-play integration for every agent framework</li>
          </ul>
          <p className="rv" style={{marginTop: '28px'}}>It is a runtime you can install today, run in observe mode, and read the evidence from. Connectors ship for GitHub and HTTP; the action model is system-agnostic.</p>
        </div>
      </section>

      {/* 09 CTA */}
      <section className="band cta" id="access">
        <div className="wrap">
          <h2 className="rv" style={{maxWidth: '20ch'}}>Put a boundary in front of your agent.</h2>
          <form className="form rv" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="you@company.com" aria-label="Work email" />
            <button type="submit" className="btn btn-solid" style={{border: 0, cursor: 'pointer'}}>Request access</button>
          </form>
        </div>
      </section>

    </div>
  );
}
