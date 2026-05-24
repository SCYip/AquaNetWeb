import { Link } from 'react-router-dom'

/* ────────────────────────────────────────────────────────────────────────────
 * AboutPage — WIRED-discipline edition.
 *
 * Photo at full intensity, headline below on canvas. No gradient veils,
 * no italic-on-CJK tricks, no bilingual decorative tags. Section content
 * is in one language. The brand wordmark in the navbar is the one
 * bilingual moment.
 * ──────────────────────────────────────────────────────────────────────────── */

const HERO_IMG = 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=2400&q=80&auto=format&fit=crop'

const PRINCIPLES = [
  {
    n: '01',
    title: '让数据可见',
    body:
      '水质数据不该只压在政府报告里。我们把原本困在 PDF 附件中的那些数字，搬到地图、时间轴、图表上——让它们能被看到、被引用、被追问。',
  },
  {
    n: '02',
    title: '汇聚社群',
    body:
      '这一代人不靠空喊环保。能写代码的写代码，能焊电路的焊电路——把技术落到一条具体的河上，比一万个口号都来得实在。',
  },
  {
    n: '03',
    title: '一手证据',
    body:
      '一手的数据，才经得起追问。盯一条河的变化、顺着污染源往上游找、跟社区一起想办法——这一切都得先有数据。',
  },
] as const

const PARTICIPATE = [
  {
    n: '01',
    title: '加入我们',
    body:
      '直接参与 AquaNet 水眸——做硬件、写代码、跑数据、写来信。也欢迎你把自己手上别的水保护项目带过来。',
  },
  {
    n: '02',
    title: '改变生活习惯',
    body:
      '少用含磷洗涤剂、不向河道扔垃圾、节约用水——一个家庭一周的小改变，乘以一百万个家庭，就是一条河的呼吸。',
  },
  {
    n: '03',
    title: '传播知识',
    body:
      '把你看到的水环境知识带到家人、朋友、社区里——一次餐桌上的提醒比一百条公众号转发都管用。',
  },
  {
    n: '04',
    title: '举报污染',
    body:
      '看到偷排、异味、可疑工厂排口——拨 12369 举报、写信给我们、把照片留下时间戳。证据是有效行动的起点。',
  },
  {
    n: '05',
    title: '贡献数据',
    body:
      '通过我们的浮标、小程序，或自己的工具，把你测到的温度、pH、浊度发给我们——一份数据就是一份证据。',
  },
  {
    n: '06',
    title: '关注与分享',
    body:
      '关注公众号、转一篇手记、把这页发给愿意听的人。一个公民观测站，靠的是被看见。',
  },
] as const

export const AboutPage = () => {
  return (
    <div>
      {/* ── HERO: photo at full intensity, headline BELOW on canvas ─── */}
      <figure>
        <img
          src={HERO_IMG}
          alt=""
          className="w-full h-[60vh] md:h-[78vh] object-cover"
          loading="eager"
        />
      </figure>

      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-20 md:pb-32">
        <h1 className="font-display text-hero text-ink">
          我们是谁。
        </h1>
        <p className="font-body text-lede text-ink mt-10 max-w-3xl">
          一个由高中生发起的公民科学项目。我们想让获取水质数据这件事——不再像现在这样难。
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/map" className="btn">看实时地图</Link>
          <Link to="/contact" className="btn-outline">给我们写信</Link>
        </div>
      </section>

      {/* ── MANIFESTO — three numbered principles, hairline-divided ─── */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="eyebrow mb-12">使命</div>
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-line">
            {PRINCIPLES.map((p, i) => (
              <article
                key={p.n}
                className={`${i > 0 ? 'pt-10 md:pt-0 border-t md:border-t-0 border-line mt-10 md:mt-0' : ''} md:px-8 first:md:pl-0 last:md:pr-0`}
              >
                <div className="meta text-ink mb-6">{p.n} — {p.title}</div>
                <p className="font-body text-body text-ink">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER'S NOTE — ink slab, paper text. No photo veil. ───── */}
      <section className="bg-ink text-canvas">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <p className="font-display text-display text-canvas leading-[1.15]">
            「我从小因为家里有人做水处理这一行，对水这件事一直比同龄人多一层敏感——它不是教科书上的化学式，而是楼下那条黄昏发臭的河。」
          </p>
          <p className="font-body text-body text-canvas/80 mt-10 max-w-2xl">
            让我真正决定做点什么的，是去年那次科研里被卡住的经历。我想分析一片水域的富营养化数据，结果发现：能拿到的，就是几张零散的报告 PDF。覆盖的河流太少、时间断断续续。
          </p>
          <p className="font-display text-display text-canvas mt-12 leading-[1.15] max-w-3xl">
            这就是 AquaNet 水眸 的起点。我想做一个工具——让普通人查水质数据，像查天气一样自然。
          </p>
          <p className="meta mt-12 text-canvas/60">叶承祖 · 创办人 · 17 · 深圳</p>
        </div>
      </section>

      {/* ── PARTICIPATE — six clean cells, 3×2 grid on canvas ───────── */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="eyebrow mb-12">参与方式</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-14 md:gap-y-16 md:gap-x-10">
            {PARTICIPATE.map((p) => (
              <article key={p.n}>
                <div className="meta text-ink mb-5">{p.n} — {p.title}</div>
                <p className="font-body text-body text-ink max-w-prose">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING — ink slab, one headline + CTA ──────────────────── */}
      <section className="bg-ink text-canvas">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <h2 className="font-display text-hero text-canvas">
            一起去看看这片水到底什么样。
          </h2>
          <p className="font-body text-lede text-canvas/80 mt-8 max-w-2xl">
            不需要写代码，不需要焊电路。你能做的，是去看一眼身边那片水，告诉我们你看见了什么。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/login" className="btn bg-canvas text-ink border-canvas hover:bg-link hover:border-link hover:text-canvas">
              登记成为观察者
            </Link>
            <Link to="/contact" className="btn-outline border-canvas text-canvas hover:bg-canvas hover:text-ink">
              先写一封信
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
