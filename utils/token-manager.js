// utils/token-manager.js - Token管理器
const Logger = require('./logger')

class TokenManager {
  static TOKEN_KEY = 'auth_token'
  static REFRESH_TOKEN_KEY = 'refresh_token'
  static TOKEN_EXPIRE_KEY = 'token_expire'

  /**
   * 保存Token
   */
  static saveToken(token, refreshToken = null, expireTime = null) {
    try {
      wx.setStorageSync(TokenManager.TOKEN_KEY, token)
      
      if (refreshToken) {
        wx.setStorageSync(TokenManager.REFRESH_TOKEN_KEY, refreshToken)
      }
      
      if (expireTime) {
        wx.setStorageSync(TokenManager.TOKEN_EXPIRE_KEY, expireTime)
      }
      
      Logger.info('Token saved successfully')
    } catch (error) {
      Logger.error('Failed to save token', error)
    }
  }

  /**
   * 获取Token
   */
  static getToken() {
    try {
      return wx.getStorageSync(TokenManager.TOKEN_KEY) || null
    } catch (error) {
      Logger.error('Failed to get token', error)
      return null
    }
  }

  /**
   * 获取刷新Token
   */
  static getRefreshToken() {
    try {
      return wx.getStorageSync(TokenManager.REFRESH_TOKEN_KEY) || null
    } catch (error) {
      Logger.error('Failed to get refresh token', error)
      return null
    }
  }

  /**
   * 检查Token是否过期
   */
  static isTokenExpired() {
    try {
      const expireTime = wx.getStorageSync(TokenManager.TOKEN_EXPIRE_KEY)
      if (!expireTime) return true
      return Date.now() > expireTime
    } catch (error) {
      Logger.error('Failed to check token expiry', error)
      return true
    }
  }

  /**
   * 清除Token
   */
  static clearToken() {
    try {
      wx.removeStorageSync(TokenManager.TOKEN_KEY)
      wx.removeStorageSync(TokenManager.REFRESH_TOKEN_KEY)
      wx.removeStorageSync(TokenManager.TOKEN_EXPIRE_KEY)
      Logger.info('Token cleared')
    } catch (error) {
      Logger.error('Failed to clear token', error)
    }
  }

  /**
   * 检查是否有有效Token
   */
  static hasValidToken() {
    const token = TokenManager.getToken()
    if (!token) return false
    return !TokenManager.isTokenExpired()
  }

  /**
   * 刷新Token
   */
  static async refreshToken(app) {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) {
      Logger.warn('No refresh token available')
      return false
    }

    try {
      const res = await app.request({
        url: '/auth/refresh',
        method: 'POST',
        data: { refreshToken }
      })

      if (res.code === 200 && res.data.token) {
        TokenManager.saveToken(
          res.data.token,
          res.data.refreshToken,
          res.data.expireTime
        )
        Logger.info('Token refreshed successfully')
        return true
      }
      return false
    } catch (error) {
      Logger.error('Failed to refresh token', error)
      return false
    }
  }
}

module.exports = TokenManager

