import {url} from '../../utils/base'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oldPw: null,
    newPw: null,
    confirmPw: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.getStorage({
          key: 'kkInfo',
          success: function(res) {
              
          },
          fail(){
                wx.navigateBack()
          }
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
  oldPwIn(e){
      this.setData({ oldPw: e.detail.value })
  },
  newPwIn(e) {
      this.setData({ newPw: e.detail.value })
  },
  comfirmPwIn(e) {
      this.setData({ confirmPw: e.detail.value })
  },
  submitPw(){
      let data = this.data
      let kkInfo = wx.getStorageSync('kkInfo')
      if (!data.oldPw || !data.newPw || !data.confirmPw){
          wx.showModal({
              title: '',
              content: '密码不能为空',
              showCancel: false
          })
          return
      }
      if (data.oldPw == data.newPw || data.oldPw == data.confirmPw){
          wx.showModal({
              title: '',
              content: '新密码不能与旧密码一致',
              showCancel: false
          })
          return
      }
      if (data.newPw !== data.confirmPw){
          wx.showModal({
              title: '',
              content: '新密码不一致',
              showCancel: false
          })
          return
      }
      wx.request({
          url: url.userSetPwd,
          data: {
              phone: kkInfo.phone,
              oldpwd: data.oldPw,
              password: data.newPw,
              cpwd: data.confirmPw
          },
          header: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          method: 'post',
          success: function(res) {
                res = res.data
                if(res.code == 200){
                    wx.showModal({
                        title: '',
                        content: '密码修改成功',
                        showCancel: false,
                        success(res){
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/user/user'
                                })
                            }
                        }
                    })
                }else{
                    wx.showModal({
                        title: '',
                        content: res.msg,
                        showCancel: false
                    })
                }
          },
          fail: function(res) {
              wx.showModal({
                  title: '',
                  content: '请求失败',
                  showCancel: false
              })
          },
          complete: function(res) {},
      })

  }

})