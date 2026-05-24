import { Link } from 'react-router-dom'

/* ────────────────────────────────────────────────────────────────────────────
 * HomePage — Issue 01, lead feature.
 *
 * Real magazine craft: issue masthead chrome, photo + caption + credit,
 * dropped initial on the lead paragraph, breakout pull quote, Roman-numeral
 * section markers, two-column body for long-form passages, an inline mid-
 * article photograph. Tokens stay the same — only composition is richer.
 * ──────────────────────────────────────────────────────────────────────────── */

const COVER_IMG   = 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=2400&q=80&auto=format&fit=crop'
const PORTRAIT_IMG = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=2400&q=80&auto=format&fit=crop'
const SPREAD_IMG  = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2400&q=80&auto=format&fit=crop'
const CLOSING_IMG = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=2400&q=80&auto=format&fit=crop'

export const HomePage = () => {
  return (
    <article>
      {/* ── ISSUE MASTHEAD STRIP ─────────────────────────────────────── */}
      <div className="masthead-strip">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-3 flex items-baseline justify-between gap-4">
          <span>AquaNet 水眸 · No. I · 卷首</span>
          <span className="hidden sm:inline text-mute">第 01 期 / 春 / 2026</span>
          <span className="text-mute">PP. 01–08</span>
        </div>
      </div>

      {/* ── COVER: full-bleed photo + caption underneath ─────────────── */}
      <figure>
        <img
          src={COVER_IMG}
          alt="A shoreline seen from above, where pale sand meets dark water."
          className="w-full h-[64vh] md:h-[82vh] object-cover"
          loading="eager"
        />
        <figcaption className="max-w-6xl mx-auto px-6 lg:px-10 mt-4 flex items-baseline justify-between gap-6">
          <span className="caption">海岸俯瞰，浅滩与深水的交界处，二〇二六年春。</span>
          <span className="caption-credit">Photograph · 水眸编辑部</span>
        </figcaption>
      </figure>

      {/* ── TITLE SPREAD ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 md:pt-28 pb-14 md:pb-20 grid grid-cols-12 gap-y-8 md:gap-x-10">
        <div className="col-span-12 md:col-span-3">
          <div className="eyebrow">卷首 · Issue No. I</div>
          <div className="meta mt-4">叶承祖 撰文<br />水眸小组 摄影</div>
        </div>
        <div className="col-span-12 md:col-span-9">
          <h1 className="font-display text-ink leading-[0.98]"
              style={{ fontSize: 'clamp(2.75rem, 7vw, 5.75rem)' }}>
            The water nearest you is already telling you something.
          </h1>
          <p className="font-display text-mute mt-8 leading-snug max-w-3xl"
             style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)' }}>
            从一条河、一座湖、一片近海开始，把水的状态从政府报告里搬到一张所有人都看得见的地图上。
          </p>
        </div>
      </section>

      {/* ── LEAD ARTICLE — drop cap + two columns + pull quote ───────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24 grid grid-cols-12 gap-y-8 md:gap-x-10">
          <aside className="col-span-12 md:col-span-3">
            <span className="section-numeral">I.</span>
            <div className="eyebrow mt-4">为什么</div>
            <p className="caption mt-3" style={{ fontStyle: 'normal' }}>
              一张水质数据的地图，普通人也能查得到。
            </p>
          </aside>

          <div className="col-span-12 md:col-span-9">
            <div className="article-body dropcap md:columns-2 md:gap-10">
              <p>
                水质数据不该只压在政府报告里。我们把原本困在 PDF 附件中的那些数字——pH、溶解氧、浊度、温度——搬到地图、时间轴、图表上，让它们能被看到、被引用、被追问。
              </p>
              <p>
                这件事的起点很小：一个高中生，一个深圳，一片人工湖。但能把它做下去的，不是一个人，而是一群愿意走到水边的人。能写代码的写代码，能焊电路的写电路，能写一封信的写一封信。
              </p>
              <p>
                AquaNet 水眸 是一份持续到 2030 年的承诺——在浮标坏掉之前，把方法、数据、教程都留下来，让下一个高中生能继续把它做下去。这一期是它的第一期。
              </p>
            </div>

            <blockquote className="pullquote">
              「水问题不是远方的事——它就在你下楼那条河里，在你周末散步那个湖里。」
              <footer className="meta mt-5">叶承祖 · 创办人</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── II. THREE PRINCIPLES — magazine spread with inline photo ─── */}
      <section className="border-t border-ink bg-canvas">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-10 grid grid-cols-12 md:gap-x-10">
          <aside className="col-span-12 md:col-span-3 mb-10 md:mb-0">
            <span className="section-numeral">II.</span>
            <div className="eyebrow mt-4">三条主张</div>
            <p className="caption mt-3" style={{ fontStyle: 'normal' }}>
              三条原则，写在第一页。
            </p>
          </aside>

          <div className="col-span-12 md:col-span-9 space-y-12">
            {[
              { n: '01', zh: '让数据可见', body: '水质数据不该只压在政府报告里。我们把原本困在 PDF 附件中的那些数字，搬到地图、时间轴、图表上——让它们能被看到、被引用、被追问。' },
              { n: '02', zh: '汇聚社群',   body: '这一代人不靠空喊环保。能写代码的写代码，能焊电路的焊电路——把技术落到一条具体的河上，比一万个口号都来得实在。' },
              { n: '03', zh: '一手证据',   body: '一手的数据，才经得起追问。盯一条河的变化、顺着污染源往上游找、跟社区一起想办法——这一切都得先有数据。' },
            ].map(p => (
              <article key={p.n} className="grid grid-cols-12 gap-y-3 md:gap-x-8 items-baseline border-t border-line pt-10">
                <div className="col-span-12 md:col-span-2">
                  <span className="font-display text-ink leading-none"
                        style={{ fontSize: 'clamp(2.5rem, 3.5vw, 3.5rem)' }}>
                    {p.n}
                  </span>
                </div>
                <h3 className="col-span-12 md:col-span-3 font-display text-ink"
                    style={{ fontSize: 'clamp(1.5rem, 2vw, 2rem)', lineHeight: 1.15 }}>
                  {p.zh}
                </h3>
                <p className="col-span-12 md:col-span-7 font-body text-body text-ink leading-relaxed">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Inline mid-article photograph */}
        <figure className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 md:pt-28">
          <img
            src={SPREAD_IMG}
            alt="Wetland reeds at golden hour, leaning into the wind."
            className="w-full h-[48vh] md:h-[64vh] object-cover"
            loading="lazy"
          />
          <figcaption className="mt-4 flex items-baseline justify-between gap-6">
            <span className="caption">湿地芦苇，傍晚时分。水边的尺度，常常被忽略。</span>
            <span className="caption-credit">Photograph · 水眸小组</span>
          </figcaption>
        </figure>
      </section>

      {/* ── III. FOUNDER NOTE — portrait + quote layout ──────────────── */}
      <section className="border-t border-ink bg-ink text-canvas">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24 md:py-32 grid grid-cols-12 gap-y-12 md:gap-x-10">
          <figure className="col-span-12 md:col-span-5">
            <img
              src={PORTRAIT_IMG}
              alt="A river bank at dusk, the kind that runs through a hometown."
              className="w-full h-[60vh] object-cover"
              loading="lazy"
            />
            <figcaption className="mt-4">
              <span className="caption text-canvas/70">湖南某段河流，黄昏。回去过暑假，看见河水变了颜色。</span>
              <span className="caption-credit text-canvas/50">Photograph · 叶承祖</span>
            </figcaption>
          </figure>

          <div className="col-span-12 md:col-span-7 md:pl-2">
            <span className="section-numeral text-canvas">III.</span>
            <div className="eyebrow text-canvas mt-4">起点 · A note from the editor</div>

            <p className="font-display text-canvas mt-10 leading-[1.18]"
               style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)' }}>
              「我的家在湖南，一个被河水切出来的地方。回去过暑假，看见河水变了颜色。到了深圳念书，学校旁的人工湖也总有几天泛着绿。」
            </p>

            <div className="article-body text-canvas mt-10 max-w-2xl">
              <p>
                这两片水教我同一件事：水问题不是远方的事，是身边的事。AquaNet 水眸 不是一家公司，是一份持续到 2030 年的承诺——在浮标坏掉之前，把方法、数据、教程都留下来，让下一个高中生能继续把它做下去。
              </p>
            </div>

            <p className="meta text-canvas/60 mt-10">叶承祖 · YIP SHING CHO · 17 · 深圳 · 创办人</p>
          </div>
        </div>
      </section>

      {/* ── IV. BY THE NUMBERS ───────────────────────────────────────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28 grid grid-cols-12 gap-y-10 md:gap-x-10">
          <aside className="col-span-12 md:col-span-3">
            <span className="section-numeral">IV.</span>
            <div className="eyebrow mt-4">今日观测 · By the numbers</div>
            <p className="caption mt-3" style={{ fontStyle: 'normal' }}>
              第一期上线时的现场。
            </p>
          </aside>

          <div className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
            {[
              { v: '5',    unit: 'BUOYS',   zh: '在线浮标' },
              { v: '3',    unit: 'METRICS', zh: '观测指标' },
              { v: '24/7', unit: 'UPTIME',  zh: '持续记录' },
              { v: '∞',    unit: 'OPEN',    zh: '完全开放' },
            ].map(s => (
              <div key={s.unit} className="border-t border-ink pt-5">
                <div className="meta">{s.unit}</div>
                <div className="font-display text-ink tnum leading-none mt-4"
                     style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)' }}>
                  {s.v}
                </div>
                <div className="font-body text-ink mt-4">{s.zh}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── V. CLOSING — photo above, headline + CTAs below ──────────── */}
      <section className="border-t border-ink">
        <figure>
          <img
            src={CLOSING_IMG}
            alt="Open ocean horizon. The water keeps going."
            className="w-full h-[52vh] md:h-[64vh] object-cover"
            loading="lazy"
          />
          <figcaption className="max-w-6xl mx-auto px-6 lg:px-10 mt-4 flex items-baseline justify-between gap-6">
            <span className="caption">远海，水线之外。</span>
            <span className="caption-credit">Photograph · Unsplash</span>
          </figcaption>
        </figure>

        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-24 md:pb-32 grid grid-cols-12 gap-y-8 md:gap-x-10">
          <aside className="col-span-12 md:col-span-3">
            <span className="section-numeral">V.</span>
            <div className="eyebrow mt-4">下一步</div>
          </aside>
          <div className="col-span-12 md:col-span-9">
            <h2 className="font-display text-ink leading-[1.02]"
                style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}>
              想一起把这条河看清楚？
            </h2>
            <p className="article-body mt-8 max-w-2xl">
              不需要写代码，不需要焊电路。你能做的，是去看一眼身边那片水，告诉我们你看见了什么。
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/login" className="btn">登记成为观察者</Link>
              <Link to="/reports" className="btn-outline">先读一封来信</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
