// utils/smart-cache-manager.js - 智能缓存管理器
const Logger = require('./logger')
const CacheManager = require('./cache-manager')

class SmartCacheManager {
  // 缓存策略
  static CACHE_STRATEGIES = {
    STATIC: 'static',       // 静态数据，长期缓存
    DYNAMIC: 'dynamic',     // 动态数据，短期缓存
    REALTIME: 'realtime'    // 实时数据，不缓存
  }

  // 策略对应的过期时间
  static STRATEGY_EXPIRE_TIMES = {
    static: 24 * 60 * 60 * 1000,  // 24小时
    dynamic: 5 * 60 * 1000,        // 5分钟
    realtime: 0                     // 不缓存
  }

  // 缓存统计
  static stats = {
    hits: 0,
    misses: 0,
    sets: 0
  }

  /**
   * 根据策略设置缓存
   */
  static setWithStrategy(key, data, strategy = SmartCacheManager.CACHE_STRATEGIES.DYNAMIC) {
    if (strategy === SmartCacheManager.CACHE_STRATEGIES.REALTIME) {
      return // 实时数据不缓存
    }

    const expireTime = SmartCacheManager.STRATEGY_EXPIRE_TIMES[strategy]
    CacheManager.set(key, data, expireTime)
    SmartCacheManager.stats.sets++
    Logger.debug(`Smart cache set: ${key}`, { strategy, expireTime })
  }

  /**
   * 获取缓存并记录统计
   */
  static getWithStats(key) {
    const data = CacheManager.get(key)
    if (data !== null) {
      SmartCacheManager.stats.hits++
      Logger.debug(`Smart cache hit: ${key}`)
    } else {
      SmartCacheManager.stats.misses++
      Logger.debug(`Smart cache miss: ${key}`)
    }
    return data
  }

  /**
   * 删除缓存
   */
  static remove(key) {
    CacheManager.remove(key)
  }

  /**
   * 清空所有缓存
   */
  static clear() {
    CacheManager.clear()
    SmartCacheManager.resetStats()
  }

  /**
   * 获取缓存统计
   */
  static getStats() {
    const total = SmartCacheManager.stats.hits + SmartCacheManager.stats.misses
    const hitRate = total > 0 ? (SmartCacheManager.stats.hits / total * 100).toFixed(2) : 0
    return {
      ...SmartCacheManager.stats,
      hitRate: `${hitRate}%`
    }
  }

  /**
   * 重置统计
   */
  static resetStats() {
    SmartCacheManager.stats = { hits: 0, misses: 0, sets: 0 }
  }

  /**
   * 预加载数据到缓存
   */
  static async preload(configs, app) {
    const results = []
    for (const config of configs) {
      try {
        const res = await app.request({ url: config.url })
        if (res.code === 200) {
          SmartCacheManager.setWithStrategy(config.key, res.data, config.strategy)
          results.push({ key: config.key, success: true })
        }
      } catch (error) {
        Logger.error(`Preload failed: ${config.key}`, error)
        results.push({ key: config.key, success: false, error })
      }
    }
    return results
  }
}

module.exports = SmartCacheManager

