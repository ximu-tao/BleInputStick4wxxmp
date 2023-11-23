//index.js
//获取应用实例
const app = getApp()
const util = require("../../utils/util");
var that;//把this对象复制到临时变量that

Page({
  data: {
    status: "未连接",
    msg: "BLEHID",
    deviceId: "",  
    connectedDeviceId: "", //已连接设备uuid
    deviceName:"ble2usbhid",
    ServicweId:'',
    writeCharacteristicsId:"",

    strcmd:'K:ABC123',

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onUnload:function(){
    that.closeBLEConnection()
    that.closeBluetoothAdapter()
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
          msg: "开始搜索",
        })

      },
      fail(res) {
        console.log(res)
      }
    })
  },

  startBluetoothDevicesDiscovery: function() {
    wx.openBluetoothAdapter({})
     that.closeConnect();
     that.setData({
     devices:{}
    })
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
          that.setData({
             msg: "蓝牙搜索失败！",
          })
          
        }
      })
    }, 500)
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
         
              for (let i = 0; i < res.devices.length; i++) {
                console.log(res.devices[i].name);
                if ('ble2usbhid' === res.devices[i].name) {
                  /* 根据指定的蓝牙设备名称匹配到deviceId */
                
                  that.deviceId=res.devices[i].deviceId,
                  　  that.setData({
                    status:"正在连接"+ that.deviceId,
                    msg: "已找到设备 正在连接！",
                  })
                  
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log(res, '已停止搜索')
          },
          fail(res) {
            console.log(res, '停止搜索失败')
          }
        })
 
                    that.connectTO();
               
                };
              };
            
          } else {
          }
        },
        fail(res) {
          console.log(res, '获取蓝牙设备列表失败=====')
        }
      })
    }, 50)
  },

  
  connectTO: function() {
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: function (res) {
        that.connectedDeviceId = that.deviceId;

        

        that.setData({
          devices: null,
          status:"已连接"+that.deviceId,
          msg: "已连接正在查找服务！",
        })
   /* 4.获取连接设备的service服务 */
   that.getBLEDeviceServices();

   
      },
      fail: function (res) {
        that.setData({
          status:"连接失败",
          msg: "连接失败！请重试",
        })
        console.log(res,"连接失败")
      }
    })
  },
  getBLEDeviceServices: function() {
    setTimeout(() => {
      wx.getBLEDeviceServices({
        deviceId: that.connectedDeviceId,
        success: function (res) {
          that.setData({
            msg: "发现服务"+JSON.stringify(res.services)
          })

          console.log(JSON.stringify(res.services))

          for (var i = 0; i < res.services.length; i++) {
 
            if(res.services[i].uuid.indexOf("FFE0")>=0)
            {
              that.setData({
                msg: "已发现服务"+res.services[i].uuid
              })

              that.services = res.services[i]
               /* 获取连接设备的所有特征值 */
          that.getBLEDeviceCharacteristics()
          break;
            }
            
          


          }
         

         
        },
        fail: (res) => {
          console.log(res)
          that.setData({
            msg: "服务搜索失败"
          })
        }
      })
    }, 500)
  },

  getBLEDeviceCharacteristics:function() {
    console.log("find char of "+that.services.uuid)
    setTimeout(() => {
      wx.getBLEDeviceCharacteristics({
        deviceId: that.connectedDeviceId,
        serviceId: that.services.uuid,
        success: function (res) {
          that.setData({
            msg: "发现特征"+res.characteristics.length
          })
          console.log('蓝牙特征值UUID:',res.characteristics)
          for (var i = 0; i < res.characteristics.length; i++) {

            
            if (   res.characteristics[i].properties.write &&　res.characteristics[i].uuid.indexOf('FFE3')>=0) { 
              that.setData({
                status:"已就绪",
                msg: "连接成功 可以操作",
              })
              /* 获取蓝牙特征值 */
              that.ServicweId = that.services.uuid;
              that.writeCharacteristicsId = res.characteristics[i].uuid
              // 启用低功耗蓝牙设备特征值变化时的 notify 功能
             // that.notifyBLECharacteristicValueChange()

             break;
            }
          }
          
        },
        fail: function (res) {
        }
      })
    }, 100)
  },

  notifyBLECharacteristicValueChange:function() { // 启用低功耗蓝牙设备特征值变化时的 notify 功能
   
    console.log('启用低功耗蓝牙设备特征值变化时的 notify 功能')
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: that.connectedDeviceId,
      serviceId: that.ServicweId,
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
 
 stringToBytes:function(str) {
  var array = new Uint8Array(str.length);
  for (var i = 0, l = str.length; i < l; i++) {
    array[i] = str.charCodeAt(i);
  }
  console.log(array);
  return array.buffer;
},
 

  
  bindViewScmd:function()
  {
    
    that.blesend(that.stringToBytes(that.data.strcmd));
  },

  blesend:function(dataBuffer)
  {
    
 
    console.log('发送的数据：' ,dataBuffer)
    wx.writeBLECharacteristicValue({
      deviceId: that.connectedDeviceId,
      serviceId: that.ServicweId,
      characteristicId: that.writeCharacteristicsId,
      value: dataBuffer,
      success: function (res) {
       
        that.setData({
          status:'操作成功',
          msg: '发送成功'
        })
        return 1;
      },
      fail: function (res) {
        console.log(res,'BLE发送失败：')
        that.setData({
          status:'操作失败',
          msg: 'send:' + that.writeDatas+'失败'
        })
        return 0;
      },
      complete: function (res) {
        console.log('BLE发送结束')
      }
    })
  },
  //str 
  sendData:function(hexstr) {
     
    hexstr = hexstr.replace(/(^\s+)|(\s+$)/g,"");
    hexstr = hexstr.replace(/\s/g,"");

    if(hexstr.length==0)return;
    /*
    let dataBuffer = new ArrayBuffer(str.length/2)
    let dataView = new DataView(dataBuffer)
    for (var i = 0; i < str.length/2; i++) {
      dataView.setUint8(i, str.charAt(i).charCodeAt())
    }
    let dataHex = that.ab2hex(dataBuffer);
    this.writeDatas = that.hexCharCodeToStr(dataHex);
    */
   let dataBuffer  = new Int8Array( util.Str2Bytes(hexstr)).buffer;
    that.blesend(dataBuffer);
  },

  //第一字节01代表键盘 第二字节代表数据长度8字节  第三字节开始是HID数据（键盘是8字节）
  bindViewSend:function(){
    that.sendData("01 08 00 00 00 00 00 00 00 00");
    that.sendData("01 08 00 00 00 00 00 00 00 00");
 },
  bindViewPrepage: function() {
    that.sendData("01 08 00 00 4B 00 00 00 00 00");
    that.sendData("01 08 00 00 00 00 00 00 00 00");
  },
  bindViewNextpage: function() {
    that.sendData("01 08 00 00 43 00 00 00 00 00");
    that.sendData("01 08 00 00 00 00 00 00 00 00");
  },
  bindViewEnter: function() {
    that.sendData("01 08 00 00 28 00 00 00 00 00 ");
    that.sendData("01 08 00 00 00 00 00 00 00 00");
  },

  bindViewEsc: function() {
    that.sendData("01 08 00 00 29 00 00 00 00 00");
    that.sendData("01 08 00 00 00 00 00 00 00 00");
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
      //that.closeBluetoothAdapter()
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
