import { useState } from 'react'
import { Mail, MapPin, Send, CheckCircle, Phone } from 'lucide-react'

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-heading font-bold text-ocean-900 mb-3">联系我们</h2>
        <p className="text-ocean-600 max-w-2xl mx-auto">
          想在深圳或您的城市部署 AquaNet？对我们的技术有疑问？我们很乐意听到您的声音。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-ocean-100/60">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sea-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-sea-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ocean-900 text-sm">邮箱</h3>
                <p className="text-ocean-600 mt-1 text-sm">contact@aquanet.io</p>
                <p className="text-ocean-400 text-xs mt-0.5">24小时内回复</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-ocean-100/60">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-ocean-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-ocean-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ocean-900 text-sm">所在地</h3>
                <p className="text-ocean-600 mt-1 text-sm">广东深圳</p>
                <p className="text-ocean-400 text-xs mt-0.5">中华人民共和国</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-ocean-100/60">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-sand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ocean-900 text-sm">电话</h3>
                <p className="text-ocean-600 mt-1 text-sm">+86 755 XXXX XXXX</p>
                <p className="text-ocean-400 text-xs mt-0.5">周一至周五 9:00-18:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lifted border border-ocean-100/60">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-sea-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-sea-500" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-ocean-900 mb-2">消息已发送！</h3>
                <p className="text-ocean-600">我们会在24小时内回复您。</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-heading font-bold text-ocean-900 mb-6">发送消息</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-ocean-800 mb-1.5">名字</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="input-field"
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-800 mb-1.5">姓氏</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        className="input-field"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ocean-800 mb-1.5">邮箱地址</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="input-field"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ocean-800 mb-1.5">主题</label>
                    <select
                      name="subject"
                      required
                      className="input-field"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="">选择主题</option>
                      <option value="deployment">在我的区域部署 AquaNet</option>
                      <option value="partnership">商业合作</option>
                      <option value="technical">技术支持</option>
                      <option value="media">媒体咨询</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ocean-800 mb-1.5">留言</label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      className="input-field"
                      placeholder="请告诉我们如何帮助您..."
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary text-base px-8 py-3 shadow-md"
                  >
                    <Send className="w-5 h-5" />
                    发送消息
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
