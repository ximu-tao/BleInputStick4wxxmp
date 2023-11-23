const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function Utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
        break;
    }
  }
  return out;
}
 


 

var mac_bytes = 6;

  function createMagicPacket(mac) {
  var mac_buffer = new Uint8Array(mac_bytes)
    , i
    ;
  if (mac.length == 2 * mac_bytes + (mac_bytes - 1)) {
    mac = mac.replace(new RegExp(mac[2], 'g'), '');
  }
  if (mac.length != 2 * mac_bytes || mac.match(/[^a-fA-F0-9]/)) {
    throw new Error("malformed MAC address '" + mac + "'");
  }

  for (i = 0; i < mac_bytes; ++i) {
    mac_buffer[i] = parseInt(mac.substr(2 * i, 2), 16);
  }

  var num_macs = 16
    , buffer   = new Uint8Array((1 + num_macs) * mac_bytes);
  for (i = 0; i < mac_bytes; ++i) {
    buffer[i] = 0xff;
  }
  for (i = 0; i < num_macs; ++i) {
    //0到mac_buffer.length-1 的数据复制到buffer (i + 1) * mac_bytes开始的位置
    //mac_buffer.copy(buffer, (i + 1) * mac_bytes, 0, mac_buffer.length)
  
    var j;
    for(j=0;j<mac_buffer.length;j++)
    {
      buffer[(i + 1) * mac_bytes+j]=mac_buffer[j];
    }
    
  }
  return buffer;
};

function ab2str(arrayBuffer) {
 // return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
   let unit8Arr = new Uint8Array(arrayBuffer);
  let encodedString = String.fromCharCode.apply(null, unit8Arr),
     decodedString = decodeURIComponent(escape((encodedString)));//没有这一步中文会乱码
  return decodedString;
}
 
  // 字符串转为ArrayBuffer对象，参数为字符串
  function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 每个字符占用2个字节
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
  bufView[i] = str.charCodeAt(i);
  }
  return buf;
  }

  
  function Str2Bytes (str)

{

var pos = 0;

var len = str.length;

if(len %2 != 0)

{

return null;

}

len /= 2;

var hexA = new Array();

for(var i=0; i<len; i++)

{

var s = str.substr(pos, 2);

var v = parseInt(s, 16);

hexA.push(v);

pos += 2;

}

return hexA;

}
 

//字节数组转十六进制字符串

 function Bytes2Str(arr)

{

var str = "";

for(var i=0; i<arr.length; i++)

{

var tmp = arr[i].toString(16);

if(tmp.length == 1)

{

tmp = "0" + tmp;

}

str += tmp;

}

return str;

}


module.exports = {
  formatTime: formatTime,
  createMagicPacket:createMagicPacket,
  str2ab:str2ab,
  ab2str:ab2str,
  Str2Bytes:Str2Bytes,
  Bytes2Str:Bytes2Str,

}
