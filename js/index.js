(function () {
    /*模拟数据*/
    //页面刚加载读取本地存储的歌曲列表
    let data=localStorage.getItem('mList') ?
    JSON.parse(localStorage.getItem('mList')) : [];
  /*  let data=[
      /!*  {
            url:'丫头.mp3',
            song:'丫头',
            singer:'王童语',
            pic:'https://p1.music.126.net/ZYkfNipPotMRfMo0a6pWWQ==/803742999937768.jpg?param=34y34'
        },{
            url:'光年之外.mp3',
            song:'光年之外',
            singer:'邓紫棋',
            pic:'https://p1.music.126.net/fkqFqMaEt0CzxYS-0NpCog==/18587244069235039.jpg?param=34y34'
        },{
            url:'初学者.mp3',
            song:'初学者',
            singer:'薛之谦',
            pic:'https://p1.music.126.net/hti_a0LADoFMBHvOBwAtRA==/1369991500930171.jpg?param=34y34'
        },{
            url:'烟火里的尘埃.mp3',
            song:'烟火里的尘埃',
            singer:'华晨宇',
            pic:'https://p1.music.126.net/_49Xz_x9kTTdEgmYYk6w2w==/6672936069046297.jpg?param=34y34'
        }
*!/
    ];*/

    let searchDate=[];

    /*获取元素*/
    let start =document.querySelector('.start');
    let next =document.querySelector('.next');
    let prev =document.querySelector('.prev');
    let audio = document.querySelector('audio');
    let nowtime = document.querySelector('.nowTime');
    let totaltimespan = document.querySelector('.totalTime');
    let ctrlBars = document.querySelector('.ctrl-bars');
    let nowBars = document.querySelector('.nowbars');
    let Rot = document.querySelector('.rot');
    let mode = document.querySelector('.mode');
    let songSinger = document.querySelector('.bars-bon span');
    let logoImg = document.querySelector('.logo img');
    let playBox = document.querySelector('.play-box ul');


    //变量
    let index = 0;//标记当前播放歌曲索引
    let str='';//用来累计播放项
    let rotateDeg=0;//记录封面旋转角度
    let timer=null;
    let modeNum=0;//0 顺序播放 1 单曲循环 2 随机播放

    //加载播放列表
    function loadPlayList(){
       if (data.length){
           let str='';//用来累计播放项
           for (let i=0;i<data.length;i++){
               str += '<li>';
               str +='<i>X</i>';
               str += '<span>'+ data[i].name +'</span>';
               str += '<span>';
               for (let j=0;j<data[i].ar.length;j++){
                   str +=data[i].ar[j].name + '  ';
               }
               str +='</span>';
               str += '</li>';
           }
           playBox.innerHTML=str;
       }
    }
    loadPlayList();

    //请求服务器
    $('.search').on('keydown',function (e) {
        if (e.keyCode===13){
            //按下回车键
            $.ajax({
                //服务器地址
                url:'https://api.imjad.cn/cloudmusic/',
                //参数
                data:{
                    type:'search',
                    s:this.value
                },
                success:function (data) {
                    searchDate=data.result.songs;
                    /*console.log(data.result.songs);*/
                    var str='';
                    for (var i=0;i<searchDate.length;i++){
                        str+='<li>';
                        str+='<span class="left song">'+ searchDate[i].name +'</span>';
                        str+='<span class="right singer">';
                        for (var j=0;j<searchDate[i].ar.length;j++){
                            str+=searchDate[i].ar[j].name+'  ';
                        }
                        str+='</span>';
                        str+='</li>';
                    }
                    $('.searchUL').html(str);
                },
                error:function (err) {
                    console.log(err);
                }
            });
            this.value=' ';
        }
    });
    //点击搜索列表
    $('.searchUL').on('click','li',function () {
        data.push(searchDate[$(this).index()]);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        index=data.length -1;
        init();
        play();
    });


    // 选中播放列表中播放的歌曲
    function checkListBox() {
        let ListBox=document.querySelectorAll('.play-box li');
        for (let i=0;i<ListBox.length;i++){
            ListBox[i].className='';
        }
        ListBox[index].className='active';
    }
    //加载播放歌曲的数量
    function loadNum() {
        $('.modes .list').html(data.length);
    }
    loadNum();

    //格式化时间
    function formTime(time) {
        return time> 9 ? time :'0' +time;
    }

    //点击播放
    $(playBox).on('click','li',function () {
        index=$(this).index();
        init();
        play();
    });
    $(playBox).on('click','i',function (e) {
        data.splice( $(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        e.stopPropagation();
    });

    //初始化播放
    function init() {
        /*给audio设置播放路径*/
        rotateDeg = 0;
        checkListBox();
        $('body').css({
            background:'url("'+ data[index].al.picUrl +'")',
            backgroundSize:'100%'
        })
        audio.src='http://music.163.com/song/media/outer/url?id='+ data[index].id +'.mp3  ';
        let str='';
        str +=data[index].name+'---';
        for (let i=0;i<data[index].ar.length;i++){
            str += data[index].ar[i].name+'  ';
        }
        songSinger.innerHTML=str;
        logoImg.src= data[index].al.picUrl;
    }
    //播放暂停
    init();

    //取不重复的随机数
    function getRandomNum() {
        let randomNum=Math.floor(Math.random()*data.length);
        if (index===randomNum){
            randomNum=getRandomNum();
        }
        return randomNum;
    }
    //播放音乐
     function play(){
         audio.play();
         clearInterval(timer);
         timer=setInterval(function () {
             rotateDeg++;
             logoImg.style.transform='rotate('+rotateDeg+'deg)';
         },30);
         start.style.backgroundPositionY='-165px';
     }
    start.addEventListener('click',function(){
        //检测歌曲是播放状态还是暂停
        if (audio.paused) {
            play();
        }else{
            audio.pause();
            clearInterval(timer);
            start.style.backgroundPositionY='-204px';
        }
    });
    //下一曲
    next.addEventListener('click',function () {
        index++;
        index=index>data.length-1?0:index;
        init();
        play();

    });
    //上一曲
    prev.addEventListener('click',function () {
        index--;
        index=index<0?data.length -1:index;
        init();
        play();

    });

    //切换播放模式
    mode.addEventListener('click',function () {
       modeNum++;
       modeNum=modeNum>2 ? 0 : modeNum;
       switch (modeNum) {
           case 0:
               mode.style.backgroundPositionX='0px';
               mode.style.backgroundPositionY='-342px';
               break;
           case 1:
               mode.style.backgroundPositionX='-63px';
               mode.style.backgroundPositionY='-342px';
               break;
           case 2:
               mode.style.backgroundPositionX='-64px';
               mode.style.backgroundPositionY='-246px';
               break;
       }
    });
    audio.addEventListener('canplay',function () {
       /* console.log(audio.duration);*/
       let totalTime = audio.duration;
       let totalM = parseInt(totalTime/60);
       let totalS = parseInt(totalTime % 60);
       totaltimespan.innerHTML=formTime(totalM)+':'+formTime(totalS);

       audio.addEventListener('timeupdate',function () {
         /*  console.log(audio.curenTime);*/
           let currentTime=audio.currentTime;
           let currentM=parseInt(currentTime / 60);
           let currentS=parseInt(currentTime % 60);
           nowtime.innerHTML=formTime(currentM)+':'+formTime(currentS);

           let barWidth=ctrlBars.clientWidth;
           let position = currentTime / totalTime * barWidth;
           nowBars.style.width=position+'px';
           Rot.style.left=position -8 +'px';

           if (audio.ended){
               switch (modeNum) {
                   case 0://顺序播放
                       next.click();
                       break;
                   case 1://单曲播放
                       init();
                       play();
                       break;
                   case 2://随机播放
                       index=getRandomNum();
                      init();
                      play();
                       break;
               }
           }

       });
       ctrlBars.addEventListener('click',function (e) {
          /* console.log(e);
           console.log(e.offsetX);*/
           audio.currentTime=e.offsetX /ctrlBars.clientWidth * audio.duration;
       });
    });
})();