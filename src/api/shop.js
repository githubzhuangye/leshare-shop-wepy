
import base from './base';
import wepy from 'wepy';
import Page from '../utils/Page';

export default class shop extends base {
  static TYPE = {
    '1': {
      key: '1',
      name: '在线商城',
      badgeText: '商城',
      basicName: '商品展示',
      basicBadgeText: '商城'
    },
    '2': {
      key: '2',
      name: '点外卖',
      badgeText: '外卖',
      basicName: '在线菜单',
      basicBadgeText: '菜单'
    }
  };

  /**
   * 访问店铺
   */
  static visit(customScene, scene) {
    const url = `${this.baseUrl}/visit_shops`;
    wepy.getSystemInfo().then(res => {
      res.customScene = customScene;
      res.scene = scene;
      return this.post(url, res);
    }).then(_ => {});
  }
  /**
   * 获取店铺信息
   */
  static async info() {
    const url = `${this.baseUrl}/shops`;
    return await this.get(url).then(data => {
      data.type = this.type();
      return data;
    });
  }

  /**
   * 获取店铺类型
   */
  static type() {
    const type = wepy.$instance.globalData.shopType;
    return this.TYPE[type];
  }
  /**
   * 获取店铺状态
   */
  static async getStatus() {
    const url = `${this.baseUrl}/shops/status`;
    const data = await this.get(url);
    // 文本转换
    data.timeText = `周一至周日 ${data.beginTime}至${data.endTime}`;
    if (data.status == 'CLOSE') {
      data.closeTips = '店铺已休息，请稍后再来';
    } else if (data.status == 'NORMAL' && !data.open) {
      data.closeTips = '店铺已休息，请稍后再来';
      // data.closeTips = `店铺已休息，营业时间：${data.beginTime} - ${data.endTime}`;
    }
    return data;
  }

  /**
   * 判断店铺是否营业
   */
  static async isStatusOpen() {
    const url = `${this.baseUrl}/shops/status`;
    const {open} = await this.get(url);
    return open;
  }

  /**
   * 获取店铺公告（第一个）
   */
  static async notices() {
    const url = `${this.baseUrl}/notices`;
    const data = await this.get(url);
    return data == null || data.length < 1 ? [{ content: '暂无公告' }] : data;
  }
  /**
   * 查询满减信息
   */
  static reduces() {
    const url = `${this.baseUrl}/reduce_rule`;
    return this.get(url).then(data => {
      data.forEach(item => {
        item.showText = `满${item.limitPrice}减${item.fee}`;
      });
      const showText = data.map(v => v.showText).join(',');
      return {
        list: data, showText
      }
    });
  }

  /**
   * 查询版本及配额信息
   */
  static chargeLimit () {
    const url = `${this.baseUrl}/shop_charge_limit`;
    return this.get(url).then(data => {
      const version = data.chargeVersion;
      data.isMember = [2, 3, 6, 7].some(value => value == version);
      data.isOrder = [4, 5, 6, 7].some(value => value == version);
      return data;
    });
  }

  /**
   * 上报FORM
   */
  static reportFormId(id, delay = 3000) {
    try {
      const url = `${this.baseUrl}/visit_shops/form_id`;
      const param = [{
        formId: id
      }];
      if (delay > 0) {
        setTimeout(() => {
          this.post(url, param, false);
        }, delay);
      } else {
        this.post(url, param, false);
      }
    } catch (e) {
      console.warn('formid上报错误', e);
    }
  }
  /**
   * 签到记录信息
   */
  static signList(memberId) {
    const url = `${this.baseUrl}/member_sign?member_id=${memberId}`;
    return this.get(url);
  }
  /**
   * 签到
   */
  static sign(memberId) {
    const url = `${this.baseUrl}/member_sign?member_id=${memberId}`;
    return this.post(url);
  }
  /**
   * 签到历史记录
   */
  static signHistory() {
    const url = `${this.baseUrl}/member_sign/history`;
    return new Page(url, this._processSignData.bind(this));
  }
  /**
   * 处理签到历史记录数据
   */
  static _processSignData(item) {
    const sign = {};
    sign.createTime = item.createTime;
    if (item.bonusType == 0) {
      sign.typeDesc = '积分';
      sign.addBonus = item.bonusResult;
    } else {
      sign.typeDesc = '优惠券';
      sign.couponName = item.coupon.name;
    }
    sign.orderId = 0;
    return sign;
  }
}
