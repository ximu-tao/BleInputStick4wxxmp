//index.js
//获取应用实例
const app = getApp()

var that;//把this对象复制到临时变量that

Page({
  data: {
    status: "未连接",
    msg: "BLEHID",
    deviceId: "",  
    connectedDeviceId: "", //已连接设备uuid
    deviceName:"JDY-23",
    notifyServicweId:'',
    notifyCharacteristicsId:"",

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    that = this;
   
  

    if (wx.openBluetoothAdapter) {
      that.setData({
        msg: "...."
      })


      wx.openBluetoothAdapter({
        success: function (res) {
          /* 获取本机的蓝牙状态 */
          
         
            that.getBluetoothAdapterState()
          that.setData({
            msg: "getBluetoothAdapterState"
          })
        },
        fail: function (err) {
          // 
          that.setData({
            msg: "初始化失败！",
          })
          
        }
      })
    } else {

    }
  },

   
 
  getBluetoothAdapterState:function() {
    
    
  
    wx.getBluetoothAdapterState({
      success: function (res) {
      
        that.startBluetoothDevicesDiscovery()
        that.setData({
          msg: "startBluetoothDevicesDiscovery！",
        })

      },
      fail(res) {
        console.log(res)
      }
    })
  },

  startBluetoothDevicesDiscovery: function() {
     
    setTimeout(() => {
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          /* 获取蓝牙设备列表 */
          that.setData({
            msg: "蓝牙搜索完毕！",
          })
          that.getBluetoothDevices()
        },
        fail(res) {
        }
      })
    }, 1000)
  },


  getBluetoothDevices: function() {
   
    setTimeout(() => {
      wx.getBluetoothDevices({
        services: [],
        allowDuplicatesKey: false,
        interval: 0,
       
       
        success: function (res) {
          console.log(JSON.stringify(res.devices))

          that.setData({
            devices: res.devices,
          })

          if (res.devices.length > 0) {
            console.log("deviceName:" + that.deviceName)
            


              for (let i = 0; i < res.devices.length; i++) {
                console.log(res.devices[i].name);
                if ('JDY-23' === res.devices[i].name) {
                  /* 根据指定的蓝牙设备名称匹配到deviceId */
                  that.setData({
                    status:"已连接",
                    
                    msg: "已找到设备 正在连接！",
                  })
                  that.deviceId=res.devices[i].deviceId,

                  wx.showToast({
                    title: "已连接",
                    icon: 'success',
                    duration: 1000
                  });

                 

                  setTimeout(() => {
                    that.connectTO();
                  }, 2000);
                };
              };
            
          } else {
          }
        },
        fail(res) {
          console.log(res, '获取蓝牙设备列表失败=====')
        }
      })
    }, 1000)
  },

  
  connectTO: function() {
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: function (res) {
        that.connectedDeviceId = that.deviceId;
        /* 4.获取连接设备的service服务 */
        that.getBLEDeviceServices();
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log(res, '停止搜索')
          },
          fail(res) {
          }
        })
      },
      fail: function (res) {
      }
    })
  },
  getBLEDeviceServices: function() {
    setTimeout(() => {
      wx.getBLEDeviceServices({
        deviceId: that.connectedDeviceId,
        success: function (res) {
          that.services = res.services
          console.log(res.services);
          /* 获取连接设备的所有特征值 */
          that.getBLEDeviceCharacteristics()
        },
        fail: (res) => {
        }
      })
    }, 1000)
  },

  getBLEDeviceCharacteristics:function() {
    setTimeout(() => {
      wx.getBLEDeviceCharacteristics({
        deviceId: that.connectedDeviceId,
        serviceId: that.services[0].uuid,
        success: function (res) {
          for (var i = 0; i < res.characteristics.length; i++) {
            if ((res.characteristics[i].properties.notify || res.characteristics[i].properties.indicate) &&
              (res.characteristics[i].properties.read && res.characteristics[i].properties.write)) {
              console.log(res.characteristics[i].uuid, '蓝牙特征值 ==========')
              /* 获取蓝牙特征值 */
              that.notifyServicweId = that.services[0].uuid;
              that.notifyCharacteristicsId = res.characteristics[i].uuid
              // 启用低功耗蓝牙设备特征值变化时的 notify 功能
              that.notifyBLECharacteristicValueChange()
            }
          }
        },
        fail: function (res) {
        }
      })
    }, 1000)
  },

  notifyBLECharacteristicValueChange:function() { // 启用低功耗蓝牙设备特征值变化时的 notify 功能
   
    console.log('启用低功耗蓝牙设备特征值变化时的 notify 功能')
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: that.connectedDeviceId,
      serviceId: that.notifyServicweId,
      characteristicId: that.notifyCharacteristicsId,
      complete(res) {
        /*用来监听手机蓝牙设备的数据变化*/
        wx.onBLECharacteristicValueChange(function (res) {
          /**/
         // that.balanceData += that.buf2string(res.value)
         // that.hexstr += that.receiveData(res.value)
           that.setData({
             msg: 'reveive:' + that.receiveData(res.value)
           })
        })
      },
      fail(res) {
        console.log(res, '启用低功耗蓝牙设备监听失败')
        
      }
    })
  },

  /*转换成需要的格式*/
  buf2string:function(buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
    return arr.map((char, i) => {
      return String.fromCharCode(char);
    }).join('');
  },
  receiveData(buf) {
    return this.hexCharCodeToStr(this.ab2hex(buf))
  },
  /*转成二进制*/
  ab2hex:function(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer), function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('')
  },
  /*转成可展会的文字*/
  hexCharCodeToStr:function(hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    var rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr;
    var len = rawStr.length;
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16);
      resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join('');
  },

  sendtest:function(){
     that.sendData("abcd");
  },
  sendData:function(str) {
   
    let dataBuffer = new ArrayBuffer(str.length)
    let dataView = new DataView(dataBuffer)
    for (var i = 0; i < str.length; i++) {
      dataView.setUint8(i, str.charAt(i).charCodeAt())
    }
    let dataHex = that.ab2hex(dataBuffer);
    this.writeDatas = that.hexCharCodeToStr(dataHex);
    wx.writeBLECharacteristicValue({
      deviceId: that.connectedDeviceId,
      serviceId: that.notifyServicweId,
      characteristicId: that.notifyCharacteristicsId,
      value: dataBuffer,
      success: function (res) {
        console.log('发送的数据：' + that.writeDatas)
        console.log('message发送成功')
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    })
  },

  // 断开设备连接
  closeConnect:function() {
    if (that.connectedDeviceId) {
      wx.closeBLEConnection({
        deviceId: that.connectedDeviceId,
        success: function (res) {
          that.closeBluetoothAdapter()
        },
        fail(res) {
        }
      })
    } else {
      that.closeBluetoothAdapter()
    }
  },
  // 关闭蓝牙模块
  closeBluetoothAdapter:function() {
    wx.closeBluetoothAdapter({
      success: function (res) {
      },
      fail: function (err) {
      }
    })
  },


})
