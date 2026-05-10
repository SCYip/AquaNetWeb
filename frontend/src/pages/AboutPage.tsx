import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

/* ────────────────────────────────────────────────────────────────────────────
 * AboutPage — AquaNet 水眸 · Feature I
 *
 * Long-form editorial feature. Continues the Field Bulletin direction set
 * by HomePage. Reads as a magazine feature article: cover → profile →
 * essay (with drop cap) → mission spread → six ways to participate →
 * colophon.
 * ──────────────────────────────────────────────────────────────────────────── */

const PARTICIPATE = [
  {
    no: '01',
    title: '加入我们',
    titleEn: 'JOIN THE BULLETIN',
    body:
      '直接参与 AquaNet 水眸——做硬件、写代码、跑数据、写来信。也欢迎你把自己手上别的水保护项目带过来。',
  },
  {
    no: '02',
    title: '改变生活习惯',
    titleEn: 'CHANGE A HABIT',
    body:
      '少用含磷洗涤剂、不向河道扔垃圾、节约用水——一个家庭一周的小改变，乘以一百万个家庭，就是一条河的呼吸。',
  },
  {
    no: '03',
    title: '传播知识',
    titleEn: 'PASS IT ON',
    body:
      '把你看到的水环境知识带到家人、朋友、社区里——一次餐桌上的提醒比一百条公众号转发都管用。',
  },
  {
    no: '04',
    title: '举报污染',
    titleEn: 'REPORT POLLUTION',
    body:
      '看到偷排、异味、可疑工厂排口——拨 12369 举报、写信给我们、把照片留下时间戳。证据是有效行动的起点。',
  },
  {
    no: '05',
    title: '贡献数据',
    titleEn: 'SUBMIT A READING',
    body:
      '通过我们的浮标、小程序，或自己的工具，把你测到的温度、pH、浊度发给我们——一份数据就是一份证据。',
  },
  {
    no: '06',
    title: '关注与分享',
    titleEn: 'SHARE THE WORD',
    body:
      '关注公众号、转一篇手记、把这页发给愿意听的人。一个公民观测站，靠的是被看见。',
  },
] as const

const MISSION_POINTS = [
  '让任何想了解所在社区水环境的人，都能从这份通讯查到第一手数据',
  '让公众参与不再是「关注一下」，而是「亲手测一测」',
  '让数据汇聚起来，能用来动态监测和管理一片水域',
  '让每个普通人都有机会从水环境的旁观者，变成它的观察者',
] as const

export const AboutPage = () => {
  return (
    <div className="bg-sand-50 text-ocean-950">
      {/* ─── 00 · MASTHEAD ──────────────────────────────────────────────── */}
      <header className="bg-grain bg-sand-50 border-b-[3px] border-double border-ocean-900/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-20 md:pt-14 md:pb-28">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-12 md:mb-16 pb-3 border-b border-ocean-300/70">
            <span>AQUANET 水眸 · 第一期 · ISSUE 01</span>
            <span className="hidden sm:inline">FEATURE I · 主题特辑</span>
            <span className="text-sea-700">关于水眸 · ABOUT</span>
          </div>

          <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 lg:gap-x-16">
            <div className="col-span-12 lg:col-span-8">
              <p className="section-eyebrow text-sea-700 mb-7">特辑 · A FEATURE</p>
              <h1 className="font-heading font-semibold text-ocean-950 leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,6rem)]">
                我们是<span className="display-italic text-sea-700">谁</span>，<br />
                <span className="display-italic text-sand-700">为什么</span>
                <br />
                做这件事。
              </h1>
              <div className="mt-10 flex items-center gap-4 mono-label text-ocean-600">
                <span className="rule-fade w-12 text-ocean-400" />
                BY THE WATER 水眸小组 · 2026
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l lg:border-ocean-300/80 flex flex-col justify-end">
              <div className="mono-label text-ocean-600 mb-4">SUBHEAD · 引言</div>
              <p className="font-body text-base md:text-lg text-ocean-800 leading-[1.7]">
                一个由高中生发起的<span className="font-semibold text-ocean-950">公民科学项目</span>。我们想让获取水质数据这件事——不再像现在这样难。
              </p>
              <div className="mt-7 pt-5 border-t border-ocean-200/80 mono-label-sm text-ocean-500 leading-[1.9]">
                A high-school-born
                <br />
                citizen-science effort
                <br />
                to make water visible.
              </div>
            </aside>
          </div>
        </div>
      </header>

      {/* ─── §01 · PROFILE — Joey ────────────────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 md:py-32">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-14 md:mb-20 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              01 · 发起人 · PROFILE
            </h2>
            <span className="mono-label text-ocean-500">FOUNDER · INTERVIEWED 2025/09</span>
          </div>

          <div className="grid grid-cols-12 gap-y-10 gap-x-6 md:gap-x-12">
            {/* Left: identifying details, like a magazine profile sidebar */}
            <aside className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="space-y-6">
                <div>
                  <div className="mono-label text-ocean-500 mb-2">NAME · 姓名</div>
                  <p className="font-heading display-italic text-3xl md:text-4xl text-ocean-950 leading-tight">
                    Joey
                  </p>
                </div>
                <div className="rule-fade w-12 text-ocean-300" />
                <div>
                  <div className="mono-label text-ocean-500 mb-2">AGE · 年龄</div>
                  <p className="font-heading text-xl text-ocean-900">17 · 11 年级</p>
                </div>
                <div>
                  <div className="mono-label text-ocean-500 mb-2">BASED IN · 落地</div>
                  <p className="font-heading text-xl text-ocean-900">广东 · 惠州</p>
                </div>
                <div>
                  <div className="mono-label text-ocean-500 mb-2">FIELD · 关注</div>
                  <p className="font-heading text-xl text-ocean-900">环境科学 · 水科技</p>
                </div>
              </div>
            </aside>

            {/* Right: the bio essay with drop cap */}
            <article className="col-span-12 md:col-span-8 lg:col-span-9 lg:pl-8 lg:border-l lg:border-ocean-200">
              <p className="text-ocean-800 leading-[1.95] text-[1.05rem] drop-cap">
                我是 Joey，17 岁，来自广东惠州的高中生。从小因为家庭里有人做水处理这一行，我对「水」这件事一直比同龄人多一层敏感——它不是教科书上的化学式，而是楼下那条总在黄昏发臭的河，是夏天藻华一阵阵漂过来的味道。
              </p>
              <p className="mt-6 text-ocean-800 leading-[1.95] text-[1.05rem]">
                让我真正决定做点什么的，是去年那次科研里被卡住的经历。我想分析一片水域的富营养化数据，结果发现：能拿到的，就是几张零散的报告 PDF。覆盖的河流太少、时间断断续续。
              </p>
              <blockquote className="mt-10 border-l-2 border-sea-400 pl-6 md:pl-8">
                <p className="display-italic text-[clamp(1.4rem,2.5vw,2.1rem)] text-ocean-900 leading-[1.25]">
                  「我很难找到我想研究的那条水的具体指标。」<br />
                  数据覆盖太稀，到了真正想动手的人那里，常常什么都没有。
                </p>
              </blockquote>
              <p className="mt-10 text-ocean-800 leading-[1.95] text-[1.05rem]">
                那一刻，我意识到：水污染不是教科书上的概念，更是发生在我们身边的现实——只是我们对它的了解，隔着一层厚重的迷雾。如果连「看见」都这么难，后面的关心和保护，还从哪一步开始呢？
              </p>
              <p className="mt-6 text-ocean-800 leading-[1.95] text-[1.05rem]">
                <span className="font-semibold text-ocean-950">这就是 AquaNet 水眸的起点。</span>
                我想做一个工具——让普通人查水质数据，像查天气一样自然。
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ─── §02 · MISSION — dark inverted ───────────────────────────────── */}
      <section className="relative bg-ocean-950 text-white overflow-hidden reveal">
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full text-bathy pointer-events-none"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M-50,${80 + i * 60} Q360,${50 + i * 65} 720,${100 + i * 60} T1500,${70 + i * 60}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
            />
          ))}
        </svg>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-28 md:py-40">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-14 md:mb-20 pb-4 border-b border-white/15">
            <h2 className="section-eyebrow text-sea-300">
              02 · 使命 · MISSION
            </h2>
            <span className="mono-label text-ocean-300">EDITORIAL STATEMENT · 编辑部声明</span>
          </div>

          <div className="grid grid-cols-12 gap-y-12 gap-x-6 md:gap-x-12">
            <div className="col-span-12 lg:col-span-7">
              <p className="display-italic text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.22] text-white">
                让任何关心身边水环境的人，<br />
                都能从这份通讯里——
                <span className="text-sea-300">查到、看见、追问</span>。
              </p>

              <p className="mt-10 text-ocean-200 leading-[1.9] text-[1.05rem] max-w-xl">
                Z 世代不靠空喊环保。我们更习惯把代码、电路、数据这些已经在手里的东西，落到一条具体的河上——
                <span className="text-white">相信普通人的集体行动，能汇成一条河的呼吸。</span>
              </p>
            </div>

            <aside className="col-span-12 lg:col-span-5 lg:col-start-8 self-end">
              <div className="bg-white/[0.04] border border-white/10 backdrop-blur-sm p-8 md:p-10">
                <div className="flex items-baseline justify-between mb-7 pb-3 border-b border-white/15">
                  <h3 className="mono-label text-sea-300">FOUR THINGS</h3>
                  <span className="mono-label-sm text-ocean-300">水眸·要做的</span>
                </div>
                <ol className="space-y-5">
                  {MISSION_POINTS.map((item, i) => (
                    <li key={i} className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-sea-400 tabular-nums shrink-0 pt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-ocean-100 leading-[1.7] text-[0.96rem]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── §03 · SIX WAYS TO PARTICIPATE ──────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-28 md:py-36">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-14 md:mb-20 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              03 · 参与方式 · SIX WAYS IN
            </h2>
            <span className="mono-label text-ocean-500">FOR ANYONE READING · 给读者</span>
          </div>

          <p className="display-italic text-[clamp(1.4rem,2.5vw,2rem)] text-ocean-900 leading-[1.25] mb-14 max-w-3xl">
            别觉得一个人没什么用。<br />
            一份微小的<span className="text-sea-700">行动</span>，乘以一百万次，<br />
            就是一条河的<span className="text-sand-700">呼吸</span>。
          </p>

          {/* Two-column editorial list — looks like a magazine spread */}
          <div className="grid grid-cols-12 gap-y-12 md:gap-y-14 gap-x-6 md:gap-x-12">
            {PARTICIPATE.map((p, i) => (
              <article
                key={p.no}
                className={[
                  'col-span-12 md:col-span-6',
                  i % 2 === 1 ? 'md:mt-10' : '',
                ].join(' ')}
              >
                <div className="flex items-baseline gap-6">
                  <span className="font-heading display-italic text-5xl md:text-6xl text-sea-700 leading-none shrink-0">
                    {p.no}
                  </span>
                  <div className="flex-1 pt-1">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-ocean-950 leading-tight">
                      {p.title}
                    </h3>
                    <p className="mt-1 mono-label text-ocean-500">— {p.titleEn}</p>
                    <div className="mt-4 mb-4 rule-fade w-12 text-ocean-300" />
                    <p className="text-ocean-700 leading-[1.75] text-[0.96rem]">
                      {p.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COLOPHON ──────────────────────────────────────────────────── */}
      <section className="bg-ocean-50 border-t border-ocean-200/80 reveal">
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <p className="mono-label text-ocean-700 mb-7">— 后记 · COLOPHON</p>
          <p className="display-italic text-[clamp(1.6rem,3.2vw,2.4rem)] text-ocean-900 leading-[1.18] mb-10">
            一起去看看<br />
            <span className="text-sea-700">这片水</span>到底什么样。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mono-label text-ocean-700">
            <Link
              to="/map"
              className="border-b border-ocean-400 pb-1 hover:text-ocean-950 hover:border-ocean-900 transition-colors inline-flex items-center gap-1"
            >
              VIEW THE LIVE MAP · 实时地图
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
            <span className="text-ocean-300 select-none" aria-hidden>·</span>
            <Link
              to="/contact"
              className="border-b border-ocean-400 pb-1 hover:text-ocean-950 hover:border-ocean-900 transition-colors inline-flex items-center gap-1"
            >
              WRITE TO US · 投稿与联系
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
