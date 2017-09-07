import React from 'react';
import { findDOMNode } from 'react-dom'
import './App.css';
import imagesDatas from '../../data/imageDatas.json'

// 获取图片信息,增加图片地址信息
// 这种使用IIFE函数，因为这个函数只使用一次，不需要复用
var imagesInfo = (function(arr) {
    let res = []
    arr.forEach(function(elem, index) {
        res[index] = elem
        res[index].imageURL = './images/'+elem.fileName
    });
    return res
})(imagesDatas);
// 得出一个随机数
var getRandom = function(low, high) {
    return Math.floor(Math.random() * (high - low)) + low
};
var get30DegRandom = function() {
    return (Math.random() > .5? '':'-') + Math.floor(Math.random() * 30) + 'deg'
};

// class ImgFigure extends React.Component {
var ImgFigure = React.createClass({
    handleClick(e) {
        e.preventDefault()
        e.stopPropagation()
        // console.log(this.props.arrange.isCenter);
        // debugger
        if(this.props.arrange.isCenter) {
            this.props.inverse()
        }else {
            this.props.center()
        }
    },
    render() {
        var arrange = this.props.arrange;
        var styleObj = {
            left: arrange.pos.left+'px',
            top: arrange.pos.top+'px'
        }
        // 旋转
        if(arrange.rotate) {
            /* //这里要使用驼峰命名  所以不能用-webkit- -o- 这些遍历
            ['-webkit-', '-o-', '-moz-', '-ms-', ''].forEach(function(elem, index) {
                styleObj[elem+'transform'] = 'rotate('+arrange.rotate+')'
            })*/
            ['WebkitTransform', 'OTransform', 'MozTransform', 'msTransform', 'transform'].forEach(function(elem, index) {
                styleObj[elem] = 'rotate('+arrange.rotate+')'
            })
        }
        if(arrange.isCenter) {
            styleObj.zIndex = 11
        }
        var imgFigure_className = 'img_sec' + (arrange.isInverse?' is_inverse': '');
        return (
            <figure className={imgFigure_className} onClick={this.handleClick} style={styleObj}>
                <img src={this.props.data.imageURL} alt={this.props.data.title}/>
                <figcaption>
                    <h3 className="img_title">{this.props.data.title}</h3>
                    <div className="img_back">
                        {this.props.data.desc}
                    </div>
                </figcaption>
            </figure>
        )
    }
});
// }

var Controller = React.createClass({
    handleClick(e) {
        e.preventDefault()
        e.stopPropagation()
        if(this.props.arrange.isCenter) {
            this.props.inverse()
        }else {
            this.props.center()
        }

    },
    render(){
        var arrange = this.props.arrange;
        var Controller_className = 'unit';
        if(arrange.isCenter) {
            Controller_className += ' unit_center'
        }
        if(arrange.isInverse) {
            Controller_className += ' unit_inverse'
        }
        return (
            <div className={Controller_className} onClick={this.handleClick} ></div>
        )
    }
});


var App = React.createClass({
    // 定义图片取值范围
    Constant: {
        centerPos: {
            left: '0',
            top: '0'
        },
        hPosRange: {
            leftSecX: ['0', '0'],
            rightSecX: ['0', '0'],
            y: ['0', '0']
        },
        vPosRange: {
            x: ['0', '0'],
            topY: ['0', '0']
        }
    },
    // 是否反转的处理函数  注意这里是一个闭包
    inverse(index) { // 子组件只能调用父组件中的函数，从而改变状态
        return function() {
            var imgsArrangeArr = this.state.imgsArrangeArr;
            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse
            this.setState({  // 这句话只能写在父组件中
                imgsArrangeArr: imgsArrangeArr
            })
        }.bind(this)
    },
    // 指定中心图片的索引，从而排列出所有图片
    rearrange(centerIndex) {
        var imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeX = vPosRange.x,
            vPosRangeTopY = vPosRange.topY;
        //  找到中心图片的位置对象，为其赋值
        var imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
        imgsArrangeCenterArr[0] = {  // 中心图片永远不旋转
            pos: centerPos,
            isCenter: true,
            isInverse: false
        };

        //  顶部图片最多1张，先找到顶部图片位置对象，然后为其赋值
        var topNum = Math.floor(Math.random() * 2); // 可能为0，可能是1
        var imgsArrangeTopArr = imgsArrangeArr.splice(centerIndex, topNum);
        for(var k=0; k<imgsArrangeTopArr.length; k++) {
            var topArrLeft = getRandom(vPosRangeX[0], vPosRangeX[1]),
                topArrTop =  getRandom(vPosRangeTopY[0], vPosRangeTopY[1]);
            imgsArrangeTopArr[k] = {
                pos: {
                    left: topArrLeft,
                    top: topArrTop
                },
                rotate: get30DegRandom(),
                isCenter: false,
                isInverse: false
            }
        }

        //  水平方向图片
        var imgsArrangeHArr = imgsArrangeArr;
        for(var i=0; i<imgsArrangeHArr.length; i++) {
            var hPosRangeX = null;
            if(i < imgsArrangeHArr.length / 2) {
                // 左侧
                hPosRangeX = getRandom(hPosRangeLeftSecX[0], hPosRangeLeftSecX[1])
                imgsArrangeHArr[i] = {
                    pos: {
                        left: hPosRangeX,
                        top: getRandom(hPosRangeY[0], hPosRangeY[1])
                    },
                    rotate: get30DegRandom(),
                    isCenter: false,
                    isInverse: false
                }
            }else {
                // 右侧
                hPosRangeX = getRandom(hPosRangeRightSecX[0], hPosRangeRightSecX[1])
                imgsArrangeHArr[i] = {
                    pos: {
                        left: hPosRangeX,
                        top: getRandom(hPosRangeY[0], hPosRangeY[1])
                    },
                    rotate: get30DegRandom(),
                    isCenter: false,
                    isInverse: false
                }
            }
        }
        // 将顶部图片的信息和中心图片的信息加入到imgsArrangeArr中
        if(topNum > 0) { // 加入顶部图片位置信息
            imgsArrangeArr.splice(centerIndex, 0, imgsArrangeTopArr[0])
        }
        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]) // 加入中心图片位置信息
        this.setState({
            imgsArrangeArr: imgsArrangeArr
        })
    },
    //  让某张图片成为中心图片
    center(index) {
        return function() {
            this.rearrange(index)
        }.bind(this)
    },
    getInitialState(){
        return {
            imgsArrangeArr: [ // 列出每张图片的位置,旋转角度
            ]
        }
    },
    // 组件加载以后，为每张图定位位置,计算其位置的范围
    componentDidMount() {
        // 首先拿到舞台的大小
        var stageDOM = this.refs.stage,
            stageW = stageDOM.scrollWidth,
            stageH = stageDOM.scrollHeight,
            halfStageW =  Math.floor(stageW / 2),
            halfStageH =  Math.floor(stageH / 2);
        //  拿到一个ImgFigure的大小
        var imgDOM = findDOMNode(this.refs.ImgFigure0),
            imgW = imgDOM.scrollWidth,
            imgH = imgDOM.scrollHeight,
            halfImgW = Math.floor(imgW / 2),
            halfImgH = Math.floor(imgH / 2);

        // 确定中心图片的位置
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        }
        // 确定水平方向图片的取值范围
        var hPosRange = this.Constant.hPosRange;
        hPosRange.leftSecX[0] = -halfImgW;
        hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        hPosRange.rightSecX[0] = halfStageW + halfImgW;
        hPosRange.rightSecX[1] = stageW - halfImgW;
        hPosRange.y[0] = -halfImgH;
        hPosRange.y[1] = stageH - halfImgH;

        // 确定垂直方向图片的取值范围
        var vPosRange = this.Constant.vPosRange;
        vPosRange.x[0] = halfStageW - imgW;
        vPosRange.x[1] = halfStageW + imgW;
        vPosRange.topY[0] = -halfImgH;
        vPosRange.topY[1] = halfStageH - halfImgH * 3;

        // 初始化图片位置
        this.rearrange(0)
    },
    render() {
        var ImgFigures = [],
            ControllerUnits = [];
        imagesInfo.forEach((elem, index) => {
            if(!this.state.imgsArrangeArr[index]) {
                this.state.imgsArrangeArr[index] = {
                    pos: {
                        left: '0',
                        top: '0'
                    },
                    rotate: '0',
                    isCenter: false,
                    isInverse: false
                }
            }
            ImgFigures.push(<ImgFigure key={index}
                                       center={this.center(index)}
                                       inverse={this.inverse(index)}
                                       ref={'ImgFigure'+index}
                                       arrange={this.state.imgsArrangeArr[index]}
                                       data={elem}/>)
            /*ImgFigures.push(<ImgFigure key={index}
                                       ref={(figure)=>{var attr = 'ImgFigure'+index;
                                           this[attr] = figure } }
                                       arrange={this.state.imgsArrangeArr[index]} data={elem} />)*/

            ControllerUnits.push(<Controller
                key={index} data={elem}
                center={this.center(index)}
                inverse={this.inverse(index)}
                arrange={this.state.imgsArrangeArr[index]}/>)
        });

        return (
            <section className="stage" ref="stage">
                <section className="imgSec_wrapper">
                    {ImgFigures}
                </section>
                <nav className="controller_nav">
                    {ControllerUnits}
                </nav>
            </section>
        )
    }
})

export default App;
