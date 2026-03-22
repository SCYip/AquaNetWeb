export interface SmsConfig {
  accessKeyId: string
  accessKeySecret: string
  signName: string
  templateCode: string
}

export const sendSms = async (
  phoneNumber: string,
  code: string,
  config: SmsConfig
): Promise<{ success: boolean; message: string }> => {
  // If not configured, just log the code (development mode)
  if (!config.accessKeyId || config.accessKeyId === 'your_access_key_id' || config.accessKeyId === '') {
    console.log(`[DEV] SMS to ${phoneNumber}: ${code}`)
    return { success: true, message: 'Development mode - code logged to console' }
  }

  // Production: use Alibaba Cloud SMS API via HTTP
  try {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const SignatureNonce = Math.random().toString(36).substring(2)

    // Simple SMS via Alibaba Cloud OpenAPI
    const response = await fetch('https://dysmsapi.aliyuncs.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        Format: 'JSON',
        Version: '2017-05-25',
        Signature: '',
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce,
        SignatureVersion: '1.0',
        AccessKeyId: config.accessKeyId,
        Timestamp: timestamp,
        Action: 'SendSms',
        RegionId: 'cn-hangzhou',
        PhoneNumbers: phoneNumber,
        SignName: config.signName,
        TemplateCode: config.templateCode,
        TemplateParam: JSON.stringify({ code }),
      }),
    })

    const result = await response.json() as { Code?: string; Message?: string }
    if (result.Code === 'OK') {
      return { success: true, message: 'SMS sent successfully' }
    } else {
      return { success: false, message: result.Message || 'Failed to send SMS' }
    }
  } catch (error) {
    console.error('SMS send error:', error)
    return { success: false, message: 'Failed to send SMS' }
  }
}
