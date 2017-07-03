// pages/user/index.js
import { url } from "../../utils/base.js"
import setNavbar from '../../template/navbar/navbar'
Page({
  data: {
    
  },
  onLoad: function (options) {
      setNavbar(this,3)
    let kkInfo = wx.getStorageSync('kkInfo')
    if(kkInfo){
        this.getUserDetail(kkInfo.token)
        .then(res=>{
            res = res.data
            let user = res.data.user
            if(res.code == 200){
                let tenantText = ["租客未认证", "租客认证中", "租客认证中", "租客未通过审核", "租客已认证"]
                let carownerText = ["车主未认证", "车主认证中", "车主认证中", "车主未通过审核", "车主已认证", "", "", "", "", "车主未认证", "车主未认证"]
                this.setData({
                    headpic: user.headpic,
                    carowner: {
                        text: carownerText[user.carownerType],
                        num: user.carownerType
                    },
                    tenant:{
                        text: tenantText[user.tenantType],
                        num: user.tenantType
                    },
                    countMessage: user.countMessage,
                    countCoupon: user.countCoupon,
                    countCollectCar: user.countCollectCar,
                    userMoney: user.userMoney,
                    userName: user.nickName || user.userName,
                    phone: user.phone
                })
            }else{
                if(res.code == 401){
                    wx.navigateTo({
                        url: '/pages/login/login',
                        success: function (res) { },
                        fail: function (res) { },
                        complete: function (res) { },
                    })
                    return
                }
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false
                })
            }
        })
        .catch(err=>{
            wx.redirectTo({
                url: '/pages/login/login',
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
            })
        
        })
    }
  },
  getUserDetail(token){
      return new Promise((resolve, reject) => {
          wx.request({
              url: url.userDetail,
              data: {
                  token: token,
              },
              success(res) {
                  resolve(res);
              },
              fail(err) {
                  reject(err);
              }
          })
      })
  },
  userSetting(){
      wx.getStorage({
          key: 'kkInfo',
          success: function(res) {
                wx.navigateTo({
                    url: '/pages/user_setting/user_setting',
                    success: function(res) {},
                    fail: function(res) {},
                    complete: function(res) {},
                })
          },
          fail(){

          }
      })
  },
  turnToWallet(){
      wx.navigateTo({
          url: '/pages/wallet/wallet',
          success: function(res) {},
          fail: function(res) {
              wx.redirectTo({
                  url: '/pages/wallet/wallet',
              })
          },
          complete: function(res) {},
      })
  },
  turnAuthenti(){
      let tenantType = this.data.tenant.num
      let carownerType = this.data.carowner.num
      if (tenantType == 4 && carownerType == 4){
          return
      }
      wx.navigateTo({
          url: '/pages/authenticate/authenticate',
      })
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
  
  }
})