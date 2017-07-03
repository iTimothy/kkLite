import setNavbar from '../../template/navbar/navbar'
import {url} from '../../utils/base'
Page({
  data: {
      toggleOrderType: 0,
      runningListOrder:[''],
      finishListOrder: [''],
      statusObj:{
          0: 'http://192.168.1.240/kkLite/asset/o5.png',
          1: 'http://192.168.1.240/kkLite/asset/o4.png',
          2: 'http://192.168.1.240/kkLite/asset/o6.png',
          3: 'http://192.168.1.240/kkLite/asset/o7.png',
          4: 'http://192.168.1.240/kkLite/asset/o10.png',
          5: 'http://192.168.1.240/kkLite/asset/o9.png',
          9: 'http://192.168.1.240/kkLite/asset/o2.png', 
      }
  },
  onLoad: function (options) {
      setNavbar(this, 2)
      let that = this
      this.getOrders(0)
      .then(res=>{
          res = res.data
          if(res.code == 402 || res.code == 401){
              wx.redirectTo({
                  url: '/pages/login/login?from=pages_order_order',
              })
              return
          }
          if(res.code == 200){
              res.data.listOrder.map(it=>{
                  it['btnTxt'] = that.getBtnText(it.orderState)
              })
              that.setData({
                  runningListOrder: res.data.listOrder
              })
          }
      })
      .catch(err=>{
          
      })
      this.getOrders(1)
          .then(res => {
              res = res.data
              if (res.code == 402 || res.code == 401) {
                  wx.redirectTo({
                      url: '/pages/login/login?from=pages_order_order',
                  })
                  return
              }
              if (res.code == 200) {
                  res.data.listOrder.map(it => {
                      it['btnTxt'] = that.getBtnText(it.orderState)
                  })
                  that.setData({
                      finishListOrder: res.data.listOrder
                  })
              }
          })
          .catch(err => {

          })
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  toggleOrder(e){
    this.setData({
        toggleOrderType: e.target.dataset.index 
    })
  },
  getOrders(orderState){
      let kkInfo = wx.getStorageSync('kkInfo')
      if(!kkInfo){
            wx.redirectTo({
                url: '/pages/login/login?from=pages_order_order',
            })
            return
      }
      return new Promise((resolve,reject)=>{
          wx.request({
              url: url.listOrder,
              data: {
                  token: kkInfo.token,
                  orderState: orderState,
                  page: 1,
                  pageSize: 1000
              },
              header: { 'Content-Type': 'application/x-www-form-urlencoded'},
              method: 'post',
              success: function (res) { resolve(res)},
              fail: function (res) { reject(res)},
          })
      })
        
  },
  getBtnText(orderState){
      let orderStateText = ''
        switch(orderState) {
            case -2:              
                orderStateText = "等待车主确认";
                break;
            case 0:
                orderStateText = "等待车主确认";
                break;
            case 2:
                orderStateText = "支付押金";
                break;
            case 3:
                orderStateText = "确认取车";
                break;
            case 4:
                orderStateText = "确认还车";
                break;
            default:
                orderStateText = "支付租金";
    }
        return orderStateText
  },
  handleOrder(orderId){
      let kkInfo = wx.getStorageSync('kkInfo')
      if (!kkInfo) {
          wx.redirectTo({
              url: '/pages/login/login?from=pages_order_order',
          })
          return
      }
      wx.request({
          url: url.confirmOrder,
          data: {
              orderId: orderId,
              token: kkInfo.token,
              loginType: 0,
              isConfirm: 1,
          },
          header: { 'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'post',
          success: function(res) {
              res = res.data
              wx.showModal({
                  content: res.msg,
                  showCancel: false,
                  confirmColor: '#e84233'
              })
          },
          fail: function(res) {
              wx.showModal({
                  content: '请求失败',
                  showCancel: false,
                  confirmColor: '#e84233'
              })
          },
          complete: function(res) {},
      })
  },
  cancelOrder(e){
      wx.showModal({
          content: '是否取消订单',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#e84233',
          confirmText: '确定',
          confirmColor: '#e84233',
          success: function(res) {
              this.handleOrder(e.target.dataset.id)
          }.bind(this),
          fail: function(res) {},
          complete: function(res) {},
      })
  },
  handleBtn(e){
    let carId = e.target.dataset.carid
    let id = e.target.dataset.id
    if(carId){
        wx.navigateTo({
            url: '/pages/car/car?carid='+carId,
        })
    }
    if(id){
        wx.navigateTo({
            url: '/pages/order_detail/order_detail?id='+id,
        })
    }
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  onPullDownRefresh(){
      wx.reLaunch({
          url: '/pages/order/order',
      })
  },
})