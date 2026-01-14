// utils/state-manager.js - 全局状态管理器
const Logger = require('./logger')

class StateManager {
  constructor() {
    this.state = {}
    this.listeners = {}
  }

  /**
   * 获取状态
   */
  get(key) {
    return this.state[key]
  }

  /**
   * 设置状态
   */
  set(key, value) {
    const oldValue = this.state[key]
    this.state[key] = value
    Logger.debug(`State updated: ${key}`, { oldValue, newValue: value })
    this.notify(key, value, oldValue)
  }

  /**
   * 批量设置状态
   */
  setMultiple(updates) {
    Object.keys(updates).forEach(key => {
      this.set(key, updates[key])
    })
  }

  /**
   * 订阅状态变化
   */
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = []
    }
    this.listeners[key].push(callback)
    
    // 返回取消订阅函数
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback)
    }
  }

  /**
   * 通知订阅者
   */
  notify(key, newValue, oldValue) {
    const keyListeners = this.listeners[key] || []
    keyListeners.forEach(callback => {
      try {
        callback(newValue, oldValue)
      } catch (error) {
        Logger.error(`State listener error: ${key}`, error)
      }
    })
  }

  /**
   * 重置状态
   */
  reset() {
    this.state = {}
    Logger.info('State reset')
  }

  /**
   * 获取所有状态
   */
  getAll() {
    return { ...this.state }
  }
}

// 全局状态管理器实例
const globalStateManager = new StateManager()

module.exports = {
  StateManager,
  globalStateManager
}

