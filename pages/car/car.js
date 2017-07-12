import {url} from "../../utils/base.js"
Page({
  data:{
      autoplay:true,
      interval: 4000,
      duration: 500,
      circular: true,
      carImgs: [],
      carId: null,
      weeks: ['日','一','二','三','四','五','六'],
      monthViewArr:[],
      monthArr:[],
      months:[],
      currentMonthViewArr:[],
      currentDate:[],
      commentList:[],
      moveClass: false
  },
  onLoad:function(options){
      wx.showLoading({
          title: '奋力加载中..',
      })
    // 页面初始化 options为页面跳转所带来的参数
      let that = this
      let sysInfo = wx.getSystemInfoSync()
      let date = new Date()
      this.setData({
          carId: options.carid,
          nowDate: `${date.getFullYear()}-${date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`}`,
          viewHeight: sysInfo.windowHeight
      })
      this.getCarDetail()
      .then(res=>{
          let data = res.data.data;
          data.car.mapimages.map(it=>{
              it.imgPath = 'http://192.168.1.240' + it.imgPath
          });
          let transmission = ["不限", "自动档", "手动档"]
          let emissions = ["不限", "1.6L及以下", "1.6L~2.0L", "2.0L~2.5L", "2.5L及以上"]
          let mileage = ["不限", "低于2万公里", "2~4万公里", "4~6万公里", "6~9万公里",
              "9~12万公里", "12~15万公里", "15~20万公里", "超过20万公里"]
          let number = ["不限", "2人", "4人", "5人", "7人", "7人以上"]
          that.setData({
              carImgs: data.car.mapimages,
              carName: data.car.carName,
              transmission: transmission[data.car.transmission - 1],
              carMoney: data.car.money,
              carMoneyHour: data.car.hourlyMoney,
              islike: data.car.isCollect,
              isCarDoor: data.car.isCarDoor,
              convenientAddress: data.car.convenientAddress,
              isResponse: data.car.isResponse,
              isAutoReceived: data.car.isAutoReceived,
              isCarPromotion: data.car.isCarPromotion,
              carAddress: data.car.address,
              longitude: data.car.longitude,
              latitude: data.car.latitude,
              picWidth: sysInfo.screenWidth,
              comunityName: data.comunity.comunityName,
              carPlateNum: data.car.plateNum,
              ownerName: data.car.userName,
              orderrate: data.car.orderrate,
              byCarInfo: data.car.byCarInfo || '无',
              userrate: data.car.userrate,
              carInfo:{
                  transmission: {
                        num: data.car.transmission,
                        text: transmission[data.car.transmission - 1]
                    },//手自动不限排档
                  carEmissions: emissions[data.car.carEmissions - 1],//排量
                  year: data.car.year + '年',
                  mileage: mileage[data.car.mileage - 1],
                  peoples: '可载' + number[data.car.number - 1],
                  gps: that.inArray(1,data.car.carConfig) > -1,
                  mp3: that.inArray(4, data.car.carConfig) > -1,
                  usb: that.inArray(5, data.car.carConfig) > -1
              }
          })
      })
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      let day = date.getDate()
      let dayInWeek = new Date(date.getFullYear(), date.getMonth() + 1, day,1,0,0).getDay()
      let daysArr = this.getMonthView(year, month, 1)[1]
      let daysPreArr = []
      let daysOverArr = []
      let dayIndex = this.inArray(day, daysArr)
      if (dayInWeek !== 0){
          daysPreArr = daysArr.slice(dayIndex - dayInWeek, dayIndex)
      }
      daysOverArr = daysArr.splice(dayIndex, (14 - daysPreArr.length))
      
      this.setData({
          monthViewArr: [that.getMonthView(year, month, 1)[0], that.getMonthView(year, month + 1, 1)[0], that.getMonthView(year, month + 2, 1)[0]],
          monthArr: [that.getMonthView(year, month, 1)[1], that.getMonthView(year, month + 1, 1)[1], that.getMonthView(year, month + 2, 1)[1]],
          months: [this.getTwoBit(month), this.getTwoBit(month + 1), this.getTwoBit(month + 2)],
          currentMonthViewArr: daysPreArr.concat(daysOverArr),
          currentDate: [year, month, day]
      })

      this.getCarComment()
      .then(res=>{
          let data = res.data
          if(data.code == 200){
              let listComment = data.data.listComment
              if (listComment.length > 0){
                  listComment.map(it =>{
                      it.create_time = `
                        ${it.create_time.split(' ')[0].split('-')[1] }-${it.create_time.split(' ')[0].split('-')[2]}`                     
                      it.starArr = []
                      for (let i = 0; i < it.carScore; i++){
                          it.starArr.push(1)
                      }
                      if (it.carScore < 5){
                          for (let j = 0; j < 5 - it.carScore; j++){
                              it.starArr.push(0)
                          }
                      }
                  })
              }
              that.setData({
                  commentList: listComment
              })
          }
      })
      .catch(err=>{
          throw new Error(err)
      })

  },
  rentFn(){
	  wx.navigateTo({
          url: '/pages/rent/rent?carid=' + this.data.carId,
		  success: function(res) {},
		  fail: function(res) {},
		  complete: function(res) {},
	  })
  },
  onReady:function(){
    // 页面渲染完成
      wx.hideLoading()
      
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  getCarDetail(){
      let that = this;
      let kkInfo = wx.getStorageSync('kkInfo')
      let data = {
          carId: that.data.carId
      }
      kkInfo && (data.userId = kkInfo.id)
      return new Promise((resolve,reject)=>{
            wx.request({
                url: url.carDetail,
                data: data,
                success(res){
                    resolve(res);
                },
                fail(err){
                    reject(err);
                }
            })
      })
  },
  getCarComment(){
      let that = this
      return new Promise((resolve, reject) => {
          wx.request({
              url: url.carComment,
              data: {
                  carId: that.data.carId,
                  page: 1,
                  pageSize: 5
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
  likeFn(){
      let kkInfo = wx.getStorageSync('kkInfo')
      let that = this
      if(!kkInfo){
          wx.showModal({
              title: '提示',
              content: '您还未登陆，不能收藏该车',
              showCancel: false
          })
          return false
      };
      if (this.data.islike){
          wx.request({
              url: url.cancelCollectCar,
              data: {
                  userId: kkInfo.id,
                  carId: that.data.carId,
                  token: kkInfo.token
              },
              success: function(res) {
                  res = res.data
                  if(res.code == 200){
                      that.setData({ islike: !that.data.islike })
                  }else{
                      wx.showModal({
                          title: '提示',
                          content: res.msg,
                          showCancel: false
                      })
                  }
              },
              fail: function(res) {},
              complete: function(res) {},
          })
      }else{
          wx.request({
              url: url.collectCar,
              data: {
                  userId: kkInfo.id,
                  carId: that.data.carId,
                  token: kkInfo.token
              },
              success: function(res) {
                  res = res.data
                  if (res.code == 200) {
                      that.setData({ islike: !that.data.islike })
                  } else {
                      wx.showModal({
                          title: '提示',
                          content: res.msg,
                          showCancel: false
                      })
                  }
              },
              fail: function(res) {},
              complete: function(res) {},
          })
      }
      
  },
  showCarDesc(e){
      wx.showModal({
          title: '',
          content: e.target.dataset.msg,
          showCancel: false,
          confirmColor: '#e84233'
      })
  },
  showDateModal(){
      this.setData({
          showDateModal: !this.data.showDateModal
      })
  },
  closeDateModal(){
      this.setData({
          showDateModal: false
      })
  },
  getTwoBit(n){
      return n > 9 ? n : `0${n}`
  },
  inArray(num,arr){
      let ret = -1
      if(!arr) return ret
    arr.map((it,i)=>{
       if(it == num){
           ret = i
       }
    })
    return ret
  },
  getMonthView(aYear, aMonth ,aDay){
      let date = new Date(aYear, aMonth, aDay,1,0,0)
      let year = date.getFullYear()
      let month = date.getMonth()
      let firstDayInWeek = date.getDay()
      let days = 0
      let maxMonth = [1, 3, 5, 7, 8, 10, 12]
      let minMonth = [4, 6, 9, 11]
      let preDayView = []
      let preDays = []
      let dayView = []
      let daySs = []
      if(year % 4 === 0){
            if(month === 2){
                days = 29
            }
      }else{
          if (month === 2) {
              days = 28
          }
      }
      this.inArray(month, maxMonth) > -1 && (days = 31)
      this.inArray(month, minMonth) > -1 && (days = 30)
      if(days > 0){
          for (let i = 0; i < firstDayInWeek; i++){
              preDayView.push(0)
              preDays.push(0)
          }
      }
      for (let i = 1; i <= days; i++){
          dayView.push(`${year}-${this.getTwoBit(month)}-${this.getTwoBit(i)}`)
          daySs.push(`${this.getTwoBit(i)}`)
      }
      return [preDayView.concat(dayView), preDays.concat(daySs)]
  },
  backFn(){
      if(getCurrentPages().length === 1){
            wx.redirectTo({
                url: '/pages/index/index'
            })
      }else{
          wx.navigateBack()
      }  
  },
  backHome(){
      wx.redirectTo({
          url: '/pages/index/index'
      })
  },
  onPageScroll(event){
        if (event.scrollTop >= 150) {
            this.setData({
                moveClass: true
            })
        } else {
            this.setData({
                moveClass: false
            })
        }
  },
  onShareAppMessage(options){
      return {
          title: this.data.carName,
          path: '/' + getCurrentPages()[0].route + '?carid=' + getCurrentPages()[0].options.carid,
          success(){

          },
      }
  },
})