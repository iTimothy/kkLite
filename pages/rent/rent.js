import {url} from '../../utils/base'
Page({
  data: {
    showTakeIcon: true,
    showByIcon:true,
	showTakeTime: false,
	showByTime: false,
	weeks: ['日', '一', '二', '三', '四', '五', '六'],
	monthViewArr: [],
	monthArr: [],
	toggleHalfDay: false,
	takeHour: null,
	byHour: null,
	takeMinute: null,
	byMinute: null,
	takeMonth: null,
	byMonth: null,
	showTimeModal: false,
	isSelectTakeTime: false,
	isSelectByTime: false,
	isMonOrAfter: false,//false: 上午
	showCardoor: false,
	isSelectCardoor: false,
	cardoorMoney: '',
	cardoorAdress: null,
	cardoorLatitude: null,
	cardoorLongitude: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  let that = this
	  let date = new Date()
	  let year = date.getFullYear()
	  let month = date.getMonth() + 1
	  wx.request({
		  url: url.carDetail,
		  data: {
			  carId: options.carid
		  },
		  success: function(ret) {
			  let res = ret.data
			  if(res.code == 200){
				  if(res.data.car.isCarDoor){
					  that.setData({
						  showCardoor: true
					  })
				  }
			  }
		  },
		  fail: function(res) {},
		  complete: function(res) {},
	  })

	  this.setData({
          monthViewArr: [that.getMonthView(year, month, 1)[0], that.getMonthView(year, month + 1, 1)[0], that.getMonthView(year, month + 2, 1)[0]],
          monthArr: [that.getMonthView(year, month, 1)[1], that.getMonthView(year, month + 1, 1)[1], that.getMonthView(year, month + 2, 1)[1]],
		  months: [this.getTwoBit(month), this.getTwoBit(month + 1), this.getTwoBit(month + 2)],
		  hours:this.getHours(),
		  minutes: this.getMinutes(),
		  carId: options.carid
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
  getAdress(){
	  let that = this
	  wx.chooseLocation({
		  success(obj){
			  that.setData({
				  cardoorAdress: obj.address,
				  cardoorLatitude: obj.latitude,
				  cardoorLongitude: obj.longitude,
			  })
		  },
		  fail(e){
			  wx.showModal({
				  content: '地图启用失败，请检查是否禁用了获取位置的权限',
				  showCancel: false,
				  confirmColor: '#e84233',
				  success: function (res) { },
				  fail: function (res) { },
				  complete: function (res) { },
			  })
		  }
	  })
  },
  switchCardoor(e){
	  let that = this
	  this.setData({
		  isSelectCardoor: e.detail.value
	  })
	  if (e.detail.value && this.data.cardoorMoney === ''){
		  let kkInfo = wx.getStorageSync('kkInfo')
		  wx.request({
			url: url.getCarDoorMoneyLimitArea,
			data: {
				token: kkInfo.token,
				carId: this.data.carId
			},
			success: function(ret) {
				let res = ret.data
				if(res.code == 200){
					that.setData({
						cardoorMoney: res.data.carDoorMoney
					})
				}
                if(res.code == 401 || res.code == 402){
                    wx.navigateTo({
                        url: '/pages/login/login',
                        success: function(res) {},
                        fail: function(res) {},
                        complete: function(res) {},
                    })
                }	
			},
			fail: function(res) {},
			complete: function(res) {},
		})
	  }
  },
  confirmTime(){
	  if (this.data.isSelectTakeTime && this.data.takeHour && this.data.takeMinute){
		  if (this.data.takeHour < 8 || (this.data.takeHour > 22 || (this.data.takeHour == 22 && this.data.takeMinute > 0) )){
			  wx.showModal({
				  content: '取车时间必须为08:00-22:00',
				  showCancel: false,
				  confirmColor: '#e84233',
				  success: function (res) { },
				  fail: function (res) { },
				  complete: function (res) { },
			  })
		  }else{
			  this.setData({
				  showTakeTime: true,
				  showTakeIcon: false,
				  showTimeModal: false,
				  showDateModal: false,
				  isMonOrAfter: false
			  })
		  }
		
	  }
	  if (this.data.isSelectByTime && this.data.byHour && this.data.byMinute){
		  if (this.data.byHour < 8 || (this.data.byHour > 22 || (this.data.byHour == 22 && this.data.byMinute > 0))){
			  wx.showModal({
				  content: '还车时间必须为08:00-22:00',
				  showCancel: false,
				  confirmColor: '#e84233',
				  success: function (res) { },
				  fail: function (res) { },
				  complete: function (res) { },
			  })
		  }else{
			  this.setData({
				  showByTime: true,
				  showByIcon: false,
				  showTimeModal: false,
				  showDateModal: false,
				  isMonOrAfter: false
			  })
		  }
		  
	  }
	  if (this.data.takeMinute && this.data.byMinute) {
          let takeMonthArr = this.data.takeMonth.split('-')
          let byMonthArr = this.data.byMonth.split('-')
          let takeTime = new Date(takeMonthArr[0], takeMonthArr[1], takeMonthArr[2], this.data.takeHour, this.data.takeMinute, 0)
          let byTime = new Date(byMonthArr[0], byMonthArr[1], byMonthArr[2], this.data.byHour, this.data.byMinute, 0)
		  if (byTime - takeTime < 0){
			  wx.showModal({
				  content: '还车时间不能早于取车时间。',
				  showCancel: false,
				  confirmColor: '#e84233',
				  success: function(res) {},
				  fail: function(res) {},
				  complete: function(res) {},
			  })
		  }else{
			  this.setData({
				  rentTime: this.compareTime(takeTime, byTime)
			  })
			  let promise = new Promise((resolve,reject)=>{
				  let that = this
				  wx.getStorage({
					  key: 'kkInfo',
					  success: function(res) {
						let kkInfo = res.data
						wx.request({
							url: url.orderInfo,
							data: {
								byCarTimeStr: `${that.data.takeMonth} ${that.data.takeHour}:${that.data.takeMinute}:00`,
								backCarTimeStr: `${that.data.byMonth} ${that.data.byHour}:${that.data.byMinute}:00`,
								token: kkInfo.token,
								carId: that.data.carId,
								orderType: 0,
								isCarDoor:'',
								carDoorAddress:'',
								carDoorLatitude:'',
								carDoorLongitude:'',
								channel:'',
								isNoWarn:0
							},
							header: { 'Content-Type': 'application/x-www-form-urlencoded'},
							method: 'post',
							success: function (res) { resolve(res)},
							fail: function (res) {reject(res) },
							complete: function (res) { },
						})
					  },
					  fail: function(res) {
						reject(res)
					  },
					  complete: function(res) {},
				  })
				
			  })
			  promise.then(ret=>{
				  let res = ret.data
				  if(res.code == 200){
					  let data = res.data
					this.setData({
						rentMoney: data.rentMoney,
						insurance: data.insurance,
						deposit: data.deposit,
					})
				  }else{
                      if(res.code == 401 || res.code == 402){
                          wx.navigateTo({
                              url: '/pages/login/login',
                              success: function(res) {},
                              fail: function(res) {},
                              complete: function(res) {},
                          })
                          return
                      }
					  this.setData({
						  rentMoney: '',
						  insurance:'',
						  deposit: '',
					  })
					  wx.showModal({
						  content: res.msg,
						  showCancel: false,
						  confirmColor: '#e84233',
						  success: function (res) { },
						  fail: function (res) { },
						  complete: function (res) { },
					  })
				  }
			  })
			  .catch(err=>{
				  wx.showModal({
					  content: '请求失败',
					  showCancel: false,
					  confirmColor: '#e84233',
					  success: function (res) { },
					  fail: function (res) { },
					  complete: function (res) { },
				  })
			  })
		  }
	  }
  },
  closeTimeModal(){
	  this.setData({
		  showTimeModal: false
	  })
  },
  selectHour(e){
	let index = e.target.dataset.index
	let hours = this.data.hours
	hours.map(it=>{
		it.isSelect = false
	})
	hours[index].isSelect = true
	this.setData({
		hours: hours,
		takeHour: this.data.isSelectTakeTime ? this.transHour(hours[index].num) : (this.data.takeHour ? this.data.takeHour : null),
		byHour: this.data.isSelectByTime ? this.transHour(hours[index].num) : (this.data.byHour ? this.data.byHour : null),
	})
  },
  selectMinutes(e){
	  let index = e.target.dataset.index
	  let minutes = this.data.minutes
	  minutes.map(it => {
		  it.isSelect = false
	  })
	  minutes[index].isSelect = true
	  this.setData({
		  minutes: minutes,
		  takeMinute: this.data.isSelectTakeTime ? minutes[index].num : (this.data.takeMinute ? this.data.takeMinute : null),
		  byMinute: this.data.isSelectByTime ? minutes[index].num : (this.data.byMinute ? this.data.byMinute : null),
	  })
  },
  getHours(){
	  let arr = []
	  let i = 1
	  while(i <= 12){
		  arr.push({isSelect: false,num: this.getTwoBit(i)})
		  i++
	  }
	  return arr
  },
  getMinutes(){
	  let arr = []
	  let i = 0
	  while (i <= 55) {
		  arr.push({ isSelect: false,num: this.getTwoBit(i)})
		  i += 5
	  }
	  return arr
  },
  toggleHalfDayFn(e){
	  let cur = e.target.dataset.cur
	  let id = e.target.id
	  if (id === 'morning'){
		  this.setData({
			  isMonOrAfter: false
		  })  
	  }else{
		  this.setData({
			  isMonOrAfter: true
		  })
	  }
	  if (this.data.isSelectTakeTime) {
		  this.setData({
			  takeHour: this.transHour(this.data.takeHour)
		  })
	  }
	  if (this.data.isSelectByTime) {
		  this.setData({
			  byHour: this.transHour(this.data.byHour)
		  })
	  }
	  if ((id === 'morning' && cur == false) || id === 'afternoon' && cur == true ){
		  return false
	  }
	this.setData({
		toggleHalfDay: !cur
	})
	
  },
  getTakeTime(e) {
	  this.setData({
		  isSelectTakeTime: true,
		  isSelectByTime: false,
		  showDateModal: true
	  })
  },
  getByTime(e) {
	  this.setData({
		  isSelectTakeTime: false,
		  isSelectByTime: true,
		  showDateModal: true
	  })
  },
  closeDateModal() {
	  this.setData({
		  showDateModal: false
	  })
  },
  getTwoBit(n) {
	  return n > 9 ? n : `0${n}`
  },
  transHour(n){
	  if (this.data.isMonOrAfter === true){
		  return parseInt(n) + 12 === 24 ? '00' : parseInt(n) + 12
	  }
      return parseInt(n) > 12 ? this.getTwoBit(parseInt(n) - 12) : parseInt(n) == 0 ? 12 : n
  },
  compareTime(takeTime, byTime){
	  if (new Date(byTime).getTime() - new Date(takeTime).getTime() < 0) return '';
	  let by = Date.parse(byTime.toISOString().replace(" ", "T"));
	  let take = Date.parse(takeTime.toISOString().replace(" ", "T"));
	  let time = by - take;
	  let m = time / 1000 / 60;
	  let min = m % 60;
	  let h = m / 60;
	  let d = parseInt(h / 24);
	  let day = d > 0 ? (d + "天") : "";
	  h = h >= 24 ? (h % 24) : h;
	  return day + parseInt(h) + "小时" + min + "分钟";  
  },
  inArray(num, arr) {
	  let ret = -1
	  if (!arr) return ret
	  arr.map((it, i) => {
		  if (it == num) {
			  ret = i
		  }
	  })
	  return ret
  },
  getMonthView(aYear, aMonth, aDay) {
      let date = new Date(aYear, aMonth, aDay)
	  let year = date.getFullYear()
	  let month = date.getMonth()
	  let now = new Date()
	  let nowDate = [now.getMonth() + 1, now.getDate()]
	  let firstDayInWeek = date.getDay()
	  let days = 0
	  let maxMonth = [1, 3, 5, 7, 8, 10, 12]
	  let minMonth = [4, 6, 9, 11]
	  let preDayView = []
	  let preDays = []
	  let dayView = []
	  let daySs = []
	  if (year % 4 === 0) {
		  if (month === 2) {
			  days = 29
		  }
	  } else {
		  if (month === 2) {
			  days = 28
		  }
	  }
	  this.inArray(month, maxMonth) > -1 && (days = 31)
	  this.inArray(month, minMonth) > -1 && (days = 30)
	  if (days > 0) {
		  for (let i = 0; i < firstDayInWeek; i++) {
			  preDayView.push(0)
			  preDays.push(0)
		  }
	  }
	  for (let i = 1; i <= days; i++) {
		  if (nowDate[0] === month && i < nowDate[1]){
			  dayView.push( {past: true ,text:`${year}-${this.getTwoBit(month)}-${this.getTwoBit(i)}`})
		  }else{
			  dayView.push({past:false,text:`${year}-${this.getTwoBit(month)}-${this.getTwoBit(i)}`})
		  }
		  daySs.push(`${this.getTwoBit(i)}`)
	  }
	  return [preDayView.concat(dayView), preDays.concat(daySs)]
  },
  pickMonth(e){
	  if (e.target.dataset.past !== '0'){
		  let hours = this.data.hours
		  let minutes = this.data.minutes
		  hours.map(it => {
			  it.isSelect = false
		  })
		  minutes.map(it => {
			  it.isSelect = false
		  })
		  this.setData({
			  showTimeModal: true,
			  toggleHalfDay: false,
			  takeMonth: this.data.isSelectTakeTime ? e.target.dataset.date : (this.data.takeMonth ? this.data.takeMonth : null),
			  byMonth: this.data.isSelectByTime ? e.target.dataset.date : (this.data.byMonth ? this.data.byMonth : null),
			  hours: hours,
			  minutes: minutes
		  })
	  }
  },
  submitOrder(){
	  let that = this
	  let kkInfo = wx.getStorageSync('kkInfo')
	  if(!kkInfo){
		  wx.navigateTo({
              url: '/pages/login/login',
		  })
		  return
	  }
	  if (!this.data.rentTime){
		  return
	  }
	  if (this.data.isSelectCardoor && !this.data.cardoorAdress){
		  return
	  }

	  wx.request({
		  url: url.addOrder,
		  data: {
			  byCarTimeStr: `${that.data.takeMonth} ${that.data.takeHour}:${that.data.takeMinute}:00`,
			  backCarTimeStr: `${that.data.byMonth} ${that.data.byHour}:${that.data.byMinute}:00`,
			  token: kkInfo.token,
			  carId: that.data.carId,
			  orderType: 0,
			  isCarDoor: that.data.isSelectCardoor ? 1 : 0,
			  carDoorAddress: that.data.cardoorAdress,
			  carDoorLatitude: that.data.cardoorLatitude,
			  carDoorLongitude: that.data.cardoorLongitude,
			  channel: '',
			  isNoWarn: 0	
		  },
		  header: {'Content-Type': 'application/x-www-form-urlencoded'},
		  method: 'post',
		  success: function(res) {
			  res = res.data
			  if(res.code == 200){
				wx.redirectTo({
                    url: '/pages/order/order'
				})
			  }else{
				  wx.showModal({
					  content: res.msg,
					  showCancel: false,
					  confirmColor: '#e84233'
				  })
			  }
		  },
		  fail: function(res) {},
		  complete: function(res) {},
	  })
  },
  backFn(){
	  if (getCurrentPages().length === 1) {
		  wx.redirectTo({
			  url: '/pages/index/index'
		  })
	  } else {
		  wx.navigateBack()
	  }
  },

})