import {url} from '../../utils/base'
Page({

  /**
   * 页面的初始数据
   */
  data: {
      money: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let kkInfo = wx.getStorageSync('kkInfo')
      let that = this
    wx.request({
        url: url.getUserMoney,
        data: {
            token: kkInfo.token
        },
        header: {'Content-Type': 'application/x-www-form-urlencoded'},
        method: 'post',
        success: function(res) {
            res = res.data
            if(res.code == 200){
                that.setData({ money: res.data.userMonkey.userMoney})
            }
        },
        fail: function(res) {},
        complete: function(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },
})