// utils/wechat-notification.js - 微信通知管理器
const Logger = require('./logger')

class WechatNotification {
  // 订阅消息模板ID（需要在微信公众平台配置）
  static TEMPLATE_IDS = {
    PIECEWORK_REMINDER: '',      // 计件提醒
    INVENTORY_ALERT: '',         // 库存预警
    RECONCILE_NOTICE: ''         // 对账通知
  }

  /**
   * 请求订阅消息授权
   */
  static async requestSubscription(templateIds = []) {
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds: templateIds,
        success: (res) => {
          Logger.info('Subscription request result', res)
          const accepted = templateIds.filter(id => res[id] === 'accept')
          resolve({ success: true, accepted, result: res })
        },
        fail: (err) => {
          Logger.error('Subscription request failed', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 检查通知权限
   */
  static async checkNotificationPermission() {
    return new Promise((resolve) => {
      wx.getSetting({
        withSubscriptions: true,
        success: (res) => {
          const subscriptionsSetting = res.subscriptionsSetting || {}
          Logger.debug('Notification permission', subscriptionsSetting)
          resolve(subscriptionsSetting)
        },
        fail: () => {
          resolve({})
        }
      })
    })
  }

  /**
   * 显示本地通知（使用showModal模拟）
   */
  static showLocalNotification(title, content, options = {}) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: options.showCancel !== false,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        if (options.onConfirm && res.confirm) {
          options.onConfirm()
        }
        if (options.onCancel && res.cancel) {
          options.onCancel()
        }
      }
    })
  }

  /**
   * 显示轻提示通知
   */
  static showToast(message, icon = 'none', duration = 2000) {
    wx.showToast({
      title: message,
      icon: icon,
      duration: duration
    })
  }

  /**
   * 振动提醒
   */
  static vibrate(type = 'short') {
    if (type === 'long') {
      wx.vibrateLong()
    } else {
      wx.vibrateShort()
    }
  }

  /**
   * 发送订阅消息（需要后端配合）
   */
  static async sendSubscriptionMessage(app, templateId, data, toUser) {
    try {
      const res = await app.request({
        url: '/notification/send',
        method: 'POST',
        data: {
          templateId,
          data,
          toUser
        }
      })
      Logger.info('Subscription message sent', res)
      return res
    } catch (error) {
      Logger.error('Failed to send subscription message', error)
      throw error
    }
  }
}

module.exports = WechatNotification

