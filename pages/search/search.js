import setNavbar from '../../template/navbar/navbar'
import {url} from '../../utils/base'
Page({
  data: {
      adress: '广州市',
      weeks: ['日', '一', '二', '三', '四', '五', '六'],
      monthToggle: 0,
      toggleTime: 0,//0 取车时间 1 还车时间
      filterNum: 0,
      debounceId: null,
      showFilterModal: false,
      carList: [],
      isLoad: false,
      page: 1,
      currentOrderType: 1,
      orderTypeTxt: '综合排序',
      transmission: 1,
      seat: 1,
      currentCarNameObj: [],
      carCateId: '',
      carCate: '不限品牌',
      carNameId: '',
      carName: '不限车型',
      loadTip:'加载中...',
      leasingCompanys: [],
      district: '',
      companyIds: '',
  },
  onLoad: function (options) {
      setNavbar(this, 1)
      let that = this
      let userLngs = wx.getStorageSync('userLngs');
      if (userLngs) {
          if (userLngs.desc) {
              this.setData({ 'adress': userLngs.desc })
          } else if (userLngs.city) {
              this.setData({ 'adress': userLngs.city })
          }
          this.setData({
              city: userLngs.city,
              userLongitude: userLngs.lngs.split(',')[0],
              userLatitude: userLngs.lngs.split(',')[1],
          })
      }
      let date = new Date()
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      let hour = this.getTwoBit(date.getHours())
      let day = this.getTwoBit(date.getDate()) 
      let minute = this.getTwoBit(date.getMinutes())
      let days = 0
      let nextDay = parseInt(day)
      let nextMonth = parseInt(month)
      let nextYear = month == 12 ? (year + 1) : year
      let maxMonth = [1, 3, 5, 7, 8, 10, 12]
      let minMonth = [4, 6, 9, 11]
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
      if (day == days){
          nextDay = 1
          nextMonth += 1
      }else{
          nextDay += 1
      }
      let sys = wx.getSystemInfoSync()
      let slideBarWidth = sys.screenWidth * 0.92 * 0.9
      this.setData({
          monthViewArr: [that.getMonthView(year, month, 1)[0], that.getMonthView(year, month + 1, 1)[0], that.getMonthView(year, month + 2, 1)[0]],
          monthArr: [that.getMonthView(year, month, 1)[1], that.getMonthView(year, month + 1, 1)[1], that.getMonthView(year, month + 2, 1)[1]],
          months: [this.getTwoBit(month), this.getTwoBit(month + 1), this.getTwoBit(month + 2)],
          hour: [hour, hour],
          minute: [minute, minute],
          startTime: [`${year}-${this.getTwoBit(month)}-${day}`,`${hour}:${minute}`],
          endTime: [`${nextYear}-${this.getTwoBit(nextMonth)}-${this.getTwoBit(nextDay)}`, `${hour}:${minute}`],
          slideLeft: 0,
          slideRight: 0,
          sys: sys,
          screenWidth: sys.screenWidth,
          slideBarWidth: slideBarWidth,
          stepArr: [0, slideBarWidth / 4, slideBarWidth / 4 * 2, slideBarWidth / 4 * 3, slideBarWidth],
          leftBtnStepX: 0,
          rightBtnStepX: slideBarWidth,
          slideBarLeft: 0
      })
      this.search(null,true);
      this.initCarCate()

      wx.request({
          url: url.getDistrict,
          data: {
              city: userLngs.city
          },
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          method: 'post',
          success: function(res) {
              res = res.data
              if(res.code == 200){
                  let districts = []
                  res.data.districts.map((it,index)=>{
                      districts.push({text: it, isSelect: index === 0 ? true : false })
                  })
                  that.setData({ districts: districts, district: districts.length > 0 ? districts[0].text : ''})
                  if (districts.length > 0){
                      that._getBusiness(districts[0].text)
                  }
                 
              }
          },
          fail: function(res) {},
          complete: function(res) {},
      })
  },
  onReady: function () {
  
  },
  onShow: function () {
      
  },
  toggleOrderType(e){
    let orderType = parseInt(e.target.dataset.orderType)
    let orderTypeTxt
    switch (orderType){
        case 1:
            orderTypeTxt = '综合排序'
        break;
        case 2:
            orderTypeTxt = '距离最近'
        break; 
        case 4:
            orderTypeTxt = '价格最低'
        break;
        case 5:
            orderTypeTxt = '接单率高'
        break;
    }
    this.setData({
        currentOrderType: orderType,
        page: 1,
        showFilterModal: false,
        carList: [],
        orderTypeTxt: orderTypeTxt,
        orderType: orderType
    })
    this.search(null,true)
  },
  toggleTransmission(e){
      let transmission = parseInt(e.target.dataset.transmission)
      this.setData({
          transmission: transmission
      })
  },
  toggleSeat(e){
      let seat = parseInt(e.target.dataset.seat)
      this.setData({
          seat: seat
      })
  },
  toggleTime(e){
      let date
      if (e.target.dataset.index == 0){
          date = this.data.startTime[0]
      }else{
          date = this.data.endTime[0]
      }
      let monthViewArr = this.data.monthViewArr
      monthViewArr.map(it => {
          it.map(_it => {
              if (_it != 0 && _it.text == date) {
                  _it.isSelect = true
              } else {
                  _it != 0 && (_it.isSelect = false)
              }
          })
      })
      this.setData({
          toggleTime: e.target.dataset.index,
          monthViewArr: monthViewArr,
      })
  },
    chooseCity() {
        wx.navigateTo({
            url: '/pages/choose_city/choose_city?from=pages_search_search'
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
        let date = new Date(aYear,aMonth,aDay,1,0,0)
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
            if (nowDate[0] === month && i < nowDate[1]) {
                dayView.push({ past: true, text: `${year}-${this.getTwoBit(month)}-${this.getTwoBit(i)}`, isSelect: false })
            } else {
                if (nowDate[0] === month && i == nowDate[1]){
                    dayView.push({ past: false, text: `${year}-${this.getTwoBit(month)}-${this.getTwoBit(i)}`,isSelect: true }) 
                }else{
                    dayView.push({ past: false, text: `${year}-${this.getTwoBit(month)}-${this.getTwoBit(i)}`, isSelect: false })
                }
            }
            daySs.push(`${this.getTwoBit(i)}`)
        }
        return [preDayView.concat(dayView), preDays.concat(daySs)]
    },
    pickMonth(e) {
       
        if (e.target.dataset.date && e.target.dataset.past != 0) {
            let monthViewArr = this.data.monthViewArr
            monthViewArr.map((it, index) => {
                it.map(_it => {
                    if (this.data.monthToggle == index && _it != 0 && _it.text == e.target.dataset.date) {
                        _it.isSelect = true
                    } else {
                        _it != 0 && (_it.isSelect = false)
                    }
                })
            })
            if (this.data.toggleTime == 0){
                
                this.setData({
                    startTime: [e.target.dataset.date, this.data.hour[0]+':'+ this.data.minute[0]],
                    monthViewArr: monthViewArr
                })
            }else{
                this.setData({
                    endTime: [e.target.dataset.date, this.data.hour[1] + ':' + this.data.minute[1]],
                    monthViewArr: monthViewArr
                })
            }
        }
    },
    toggleMonth(e){
        this.setData({
            monthToggle: e.target.dataset.index
        })
    },
    hourLess(){
        if (this.data.toggleTime == 0){
            if(this.data.hour[0] == 0){
                return
            }
            this.setData({
                'hour[0]': this.getTwoBit(parseInt(this.data.hour[0])- 1 ),
                'startTime[1]': this.getTwoBit(parseInt(this.data.hour[0]) - 1) + ':' + this.data.minute[0]
            })
        }else{
            if (this.data.hour[1] == 0) {
                return
            }
            this.setData({
                'hour[1]': this.getTwoBit(parseInt(this.data.hour[1]) - 1),
                'endTime[1]': this.getTwoBit(parseInt(this.data.hour[1]) - 1) + ':' + this.data.minute[1]
            })
        }
    },
    hourAdd(){
        if (this.data.toggleTime == 0) {
            if (parseInt(this.data.hour[0]) === 24) {
                return
            }
            this.setData({
                'hour[0]': this.getTwoBit(parseInt(this.data.hour[0]) + 1),
                'startTime[1]': this.getTwoBit(parseInt(this.data.hour[0]) + 1) + ':' + this.data.minute[0]
            })
        } else {
            if (parseInt(this.data.hour[1]) === 24) {
                return
            }
            this.setData({
                'hour[1]': this.getTwoBit(parseInt(this.data.hour[1]) + 1),
                'endTime[1]': this.getTwoBit(parseInt(this.data.hour[1]) + 1) + ':' + this.data.minute[1]
            })
        }
    },
    minuteLess() {
        if (this.data.toggleTime == 0) {
            if (this.data.minute[0] == 0) {
                return
            }
            this.setData({
                'minute[0]': this.getTwoBit(parseInt(this.data.minute[0]) - 1),
                'startTime[1]': this.data.hour[0] + ':' + this.getTwoBit(parseInt(this.data.minute[0]) - 1)
            })
        } else {
            if (this.data.minute[1] == 0) {
                return
            }
            this.setData({
                'minute[1]': this.getTwoBit(parseInt(this.data.minute[1]) - 1),
                'endTime[1]': this.data.hour[1] + ':' + this.getTwoBit(parseInt(this.data.minute[1]) - 1)
            })
        }
    },
    minuteAdd() {
        if (this.data.toggleTime == 0) {
            if (parseInt(this.data.minute[0]) === 59) {
                return
            }
            this.setData({
                'minute[0]': this.getTwoBit(parseInt(this.data.minute[0]) + 1),
                'startTime[1]': this.data.hour[0] + ':' + this.getTwoBit(parseInt(this.data.minute[0]) + 1)
            })
        } else {
            if (parseInt(this.data.minute[1]) === 59) {
                return
            }
            this.setData({
                'minute[1]': this.getTwoBit(parseInt(this.data.minute[1]) + 1),
                'endTime[1]': this.data.hour[1] + ':' + this.getTwoBit(parseInt(this.data.minute[1]) + 1)
            })
        }
    },
    toggleDateModal(){
        this.setData({
            showDateModal: true
        })
    },
    toggleFilter(e){
        this.setData({
            filterNum: e.target.dataset.index,
            showFilterModal: true,
        })
    },
    closeFilterModal(){
        this.setData({
            showFilterModal: false,
        })
    },
    slideStart(e){
        let touchObj = e.changedTouches[0]
        if (e.target.id === 'slideLeftBtn'){
            if (!this.data.startClientX) {
                this.setData({
                    startClientX: touchObj.clientX,
                    
                })
            }
            this.setData({
                leftBtnTouchX: touchObj.clientX
            })
        }else{
            if (!this.data.endClientX){
                this.setData({
                    endClientX: touchObj.clientX,
                   
                })
            }
            this.setData({
                rightBtnTouchX: touchObj.clientX
            })
        }
        
    },
    slideMove(e){
        if (this.data.debounceId){
            clearTimeout(this.data.debounceId)
        }
        this.data.debounceId = setTimeout(_=>{
            let nowTouchX = e.changedTouches[0].clientX            
            if (e.target.id === 'slideLeftBtn'){
                let index = Math.abs(Math.round((e.changedTouches[0].clientX - this.data.startClientX) / this.data.stepArr[1]))
                if (nowTouchX - this.data.leftBtnTouchX > 0) {
                    //向右
                    this.setData({
                        slideBarWidth: Math.abs(this.data.rightBtnStepX - this.data.stepArr[index]),
                        leftBtnStepX: this.data.stepArr[index],
                        slideBarLeft: this.data.stepArr[index] < this.data.rightBtnStepX ? this.data.stepArr[index] : this.data.rightBtnStepX,                        
                    })
                } else {
                    this.setData({
                        slideBarWidth: Math.abs(this.data.rightBtnStepX - this.data.stepArr[index]),
                        leftBtnStepX: this.data.stepArr[index],
                        slideBarLeft: this.data.stepArr[index] < this.data.rightBtnStepX ? this.data.stepArr[index] : this.data.rightBtnStepX,                        
                    })
                }
                this.setData({
                    slideLeft: this.data.stepArr[index],
                })
            }else{
               
                let index = Math.abs(Math.round(Math.abs((e.changedTouches[0].clientX - this.data.endClientX)) / this.data.stepArr[1]))  
                if(nowTouchX - this.data.rightBtnTouchX < 0){
                    //向左滑
                        this.setData({
                            slideBarWidth: Math.abs(this.data.stepArr[4 - index] - this.data.leftBtnStepX),
                            rightBtnStepX: this.data.stepArr[4 - index],
                            slideBarLeft: this.data.leftBtnStepX < this.data.stepArr[4 - index] ? this.data.leftBtnStepX : this.data.stepArr[4 - index],
                        })
                    
                }else{
                    this.setData({
                        slideBarWidth: Math.abs(this.data.stepArr[4] - this.data.stepArr[index] - this.data.leftBtnStepX),
                        rightBtnStepX: this.data.stepArr[4] - this.data.stepArr[index],
                        slideBarLeft: this.data.leftBtnStepX < this.data.stepArr[4] - this.data.stepArr[index] ? this.data.leftBtnStepX : this.data.stepArr[4] - this.data.stepArr[index]
                    })
                    
                }
                this.setData({
                    slideRight: this.data.stepArr[index],
                })
            }  
        },1000/60)
        
    },
    submitSearch(){
        this.setData({
            showDateModal: false
        })
        this.search();
    },
    search(postData, reInit) {
        let startTimeDateArr = this.data.startTime[0].split('-')
        let startTimedayArr = this.data.startTime[1].split(':')
        let endDateArr = this.data.endTime[0].split('-')
        let endDayArr = this.data.startTime[1].split(':')
        let start = `${this.data.startTime[0]} ${this.data.startTime[1]}:00`
        let end = `${this.data.endTime[0]} ${this.data.endTime[1]}:00`
        let startTime = new Date(startTimeDateArr[0], startTimeDateArr[1], startTimeDateArr[2], startTimedayArr[0], startTimedayArr[1],0).getTime()
        let endTime = new Date(endDateArr[0], endDateArr[1], endDateArr[2], endDayArr[0], endDayArr[1],0).getTime()
        if (endTime - startTime < 0) {
            wx.showModal({
                content: '还车时间不能早于取车时间',
                showCancel: false,
                confirmColor: '#e84233',
            })
            return
        }
        this.setData({
            showDateModal: false
        })
        let data = {
            byCarTime: start,
            backCarTime: end,
            money: this.data.money || 0,
            money2: this.data.money2 || 1,
            transmission: this.data.transmission || 1,
            categoryId: this.data.categoryId || '',
            orderType: this.data.orderType || 1,//综合排序 1 2 4 5
            'number': this.data.seat || 1,
            categoryType: 1,
            companyIds: this.data.companyIds || '',
            page: this.data.page,
            pageSize: 12,
            userLongitude: this.data.userLongitude,
            userLatitude: this.data.userLatitude,
            city: this.data.city,
        }
        if(postData){
            for (let key in postData) {
                if (postData.hasOwnProperty(key)) {
                    data[key] = postData[key]
                }
            }
        }
        

        let promise = new Promise((resolve,reject)=>{
            wx.request({
                url: url.communityDetail,
                data: data,
                header: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'post',
                success: function (res) {
                    resolve(res)
                },
                fail: function (res) {
                    reject(res)
                },
            })
        })
        if (reInit){
            promise.then(res => {
                this.setData({ isLoad: false, loadTip: '加载中' });
                res.data.data.listcar.map(index => {
                    index.imagePic = 'http://192.168.1.240' + index.imagePic
                })
                this.setData({ carList: res.data.data.listcar})
            })
                .catch(err => {
                    this.setData({ isLoad: false, loadTip:'请求失败' });
                })
        }
        return promise
        
    },
    onReachBottom() {
        if (this.data.isLoad) return;
        this.setData({ isLoad: true });
        this.setData({ page: ++this.data.page });
        this.search()
            .then(res => {
                this.setData({ isLoad: false, loadTip: res.data.data.listcar.length === 0 ? '没有更多' : '加载中',carList: this.data.carList.concat(res.data.data.listcar) });
            })
            .catch(err => {
                this.setData({ isLoad: false, loadTip: '请求失败'  });
            })
    },
    turnToCar(e) {
        wx.navigateTo({
            url: '/pages/car/car?carid=' + e.currentTarget.dataset.id,
        })
    },
    submitCondition(){
        let leftBtnStepX = this.data.leftBtnStepX
        let rightBtnStepX = this.data.rightBtnStepX
        let moneyIndex = this.inArray(leftBtnStepX, this.data.stepArr)
        let money2Index = this.inArray(rightBtnStepX, this.data.stepArr)
        let moneyStep = [0, 200, 500, 1000, 1]
        let money = moneyStep[moneyIndex]
        let money2 = moneyStep[money2Index]
        let categoryId = this.data.carNameId || this.data.carCateId || ''
        this.setData({
            money: money,
            money2: money2,
            categoryId: categoryId,
        })
        this.search(null, true);
        this.closeFilterModal()
    },
    resetCondition(){
        this.setData({
            money: 0,
            money2:1,
            categoryId: '',
            transmission: 1,
            'number': 1,
            seat: 1,
            carCateId: '',
            carNameId: '',
            carName: '不限车型',
            carCate: '不限品牌',
            slideLeft: 0,
            slideRight: 0,
            slideBarWidth: this.data.sys.screenWidth * 0.92 * 0.9,
            leftBtnStepX: 0,
            rightBtnStepX: this.data.sys.screenWidth * 0.92 * 0.9,
		    slideBarLeft: 0,

        })
        // this.closeFilterModal()
    },
    initCarCate(){
        let that = this
        wx.request({
            url: url.getCarCategory,
            data: { pid: 0 },
            success: function (res) {
                res = res.data
                if (res.code == 200) {
                    let carCategory = res.data.carCategory
                    carCategory.sort((a, b) => {
                        return a.eng_name.charCodeAt() - b.eng_name.charCodeAt()
                    })
                    let carCategoryTemp = {};
                    for (let i = 0, len = carCategory.length; i < len; i++) {
                        if (carCategoryTemp[carCategory[i].eng_name]) {
                            carCategoryTemp[carCategory[i].eng_name][carCategory[i].id] = carCategory[i]
                        } else {
                            carCategoryTemp[carCategory[i].eng_name] = { isSelect: false }
                            if (carCategory[i].eng_name === 'A') {
                                carCategoryTemp[carCategory[i].eng_name].isSelect = true
                            }
                            carCategoryTemp[carCategory[i].eng_name][carCategory[i].id] = carCategory[i]
                        }
                    }
                    that.setData({
                        carCategory: carCategoryTemp,
                        currentCarNameObj: carCategoryTemp['A']
                    })
                }
            },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    initCarName(pid){
        let that = this
        wx.request({
            url: url.getCarCategory,
            data: {
                pid: pid
            },
            success: function(res) {
                res =res.data
                that.setData({
                    carNameArr: res.data.carCategory
                })
            },
            fail: function(res) {},
            complete: function(res) {},
        })
    },
    getCurrentEng(e){
        let eng = e.target.dataset.eng
        let carCategory = this.data.carCategory
        for (let key in carCategory) {
            if (carCategory.hasOwnProperty(key)) {
                carCategory[key].isSelect = false
            }
        }
        let currentCarNameObj = carCategory[eng]
        currentCarNameObj.isSelect = true
        this.setData({
            currentCarNameObj: currentCarNameObj,
            carCategory: carCategory
        })
    },
    submitCarData(e){
       
        let id = e.target.dataset.id
        if(id || id == 0){
            if (this.data.carPickerType == 0) {
                this.setData({
                    carCateId: id,
                    carNameId: '',
                    carName: '不限车型',
                    carCate: e.target.dataset.cateName
                })
            } else {
                this.setData({
                    carNameId: id,
                    carName: e.target.dataset.carName
                })
            }
            this.closeCarListPicker();
        }
        
        
    },
    closeCarListPicker(){
        this.setData({
            showCarlistPicker: false
        })
    },
    showCarListPicker(){
        this.setData({
            showCarlistPicker: true
        })
    },
    handleCarData(e){
        let type = e.target.dataset.type
        this.setData({
            carPickerType: type
        })
        if(type == 1){
            if (this.data.carCateId == ''){
                wx.showModal({
                    content: '请先选择车辆品牌',
                    showCancel: false,
                    confirmColor: '#e84233',
                })
                return
            }
            this.initCarName(this.data.carCateId)
        }
        this.showCarListPicker()
    },
    _getBusiness(district){
        let that = this
        let districts = this.data.districts
        if (this.data.companyIds){
            this.setData({
                companyIds: '',
                leasingCompanys: []
            })
        }
        districts.map(it=>{
            if (it.text == district){
                it.isSelect = true
            }else{
                it.isSelect = false
            }
            
        })
        this.setData({ district: district, districts: districts })
        wx.request({
            url: url.getLeasingCompany,
            data: {
                city: this.data.city,
                district: district,
                longitude: this.data.userLongitude,
                latitude: this.data.userLatitude,
                page: 1,
                pageSize: 1000,
            },
            header: { 'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'post',
            success: function(res) {
                res = res.data
                if(res.code == 200){
                    res.data.LeasingCompanys.map(it=>it['isSelect'] = false)
                    that.setData({
                        leasingCompanys: res.data.LeasingCompanys
                    })
                }
            },
            fail: function(res) {},
            complete: function(res) {},
        })
    },
    getBusiness(e){
        let district = e.target.dataset.disCity
        this._getBusiness(district)
    },
    handleCompanyIds(id,type){
        let companyIds = this.data.companyIds
        let companyIdsArr = companyIds.split(',')
        let companyIdsObj = {}
        let ret = [];
        if (companyIdsArr.length  === 0 && type){
            companyIdsObj[id] = id
        }
        companyIdsArr.map(it=>{
            companyIdsObj[it] = it
        })
       if(type){
           if (!companyIdsObj[id]){
               companyIdsObj[id] = id
           }
       }else{
           if (companyIdsObj[id]) {
               delete companyIdsObj[id]
           }
       }
       for (let i in companyIdsObj){
           ret.push(companyIdsObj[i])
       }
       return ret.toString().indexOf(',') === 0 ? ret.toString().substr(1) : ret.toString()
    },
    handleLeasingCompanys(e){
        let id = e.target.dataset.id
        let index = e.target.dataset.index
        if(id){
            let leasingCompanys = this.data.leasingCompanys
            let companyIds = this.data.companyIds
            leasingCompanys[index].isSelect = !leasingCompanys[index].isSelect        
            this.setData({
                companyIds: this.handleCompanyIds(id, leasingCompanys[index].isSelect)
            })
            this.setData({
                leasingCompanys: leasingCompanys
            })
        }
    },
    submitBusiness(){
        this.search(null, true);
        this.closeFilterModal()
    },
    resetBusiness(){
        let leasingCompanys = this.data.leasingCompanys
        leasingCompanys.map(it => it['isSelect'] = false)
        this.setData({
            leasingCompanys: leasingCompanys,
            companyIds: ''
        })
    }
})