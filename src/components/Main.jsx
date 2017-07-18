require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';
import unit from '../unit/';

let imageDatas = require('../data/imageDatas.json');
imageDatas = ((arr) =>{
	for(let i =0;i<arr.length;i++){
		let singleImageData = arr[i];
		singleImageData.imageURL = require(`../images/${singleImageData.fileName}`);
		arr[i] = singleImageData;
	}
	return arr;
})(imageDatas);


// 图片组件
let ImgFigure = React.createClass({
	/*
	* imgFigure 的点击处理函数
	*/
	handleClick:(e) =>{
		// 如果图片居中 则翻转图片 否则 是图片居中
		if(this.prop.arrange.isCenter){
			this.props.inverse();
		}else{
			this.props.center();
		}
		e.preventDefault();
		e.stopPropagation();
	},
	render(){
		let styleObj = {};
		// 如果props属性中指定了这张图片的位置
		return (
			<figure className="img-figure">
				<img src={this.props.data.imageURL}
					alt={this.props.data.title}
				/>
				<figcaption>
					<h2 className="img-title">{this.props.data.title}</h2>
				</figcaption>
			</figure>
		);
	}
});
// 控制组件
let ControllerUnit = React.createClass({
	handleClick: (e) =>{
		// 如果点击的是当前正在选中状态的按钮，则翻转图片，否则对应的图片居中
		if(this.props.arrange.isCenter){
			this.props.inverse();
		} else {
			this.props.center();
		}
		e.preventDefault();
		e.stopPropagation();
	},
	render: () =>{
		let controlelrUnitClassName = "controller-unit";
		// 如果对应的是居中的图片，显示控制按钮的居中状态
		if(this.props.arrange.isCenter){
			controllerUnitClassName += " is-center";
			// 如果 同时对应的是翻转图片，显示控制按钮的翻转状态
			if(this.props.arrange.isInverse){
				controllerUnitClassName += " is-inverse";
			}
		}
		return (
			<span className={controllerUnitClassName} onClick={this.handleClick}></span>
		);
	}
});

let  AppComponent = React.createClass ({
	Constant:{
		centerPos:{
			left:0,
			right:0
		},
		hPosRange:{// 水平方向的取值范围
			leftSecX:[0,0],
			rightSecX:[0,0],
			y:[0,0]
		},
		vPosRange:{ // 垂直方向的取值范围
			x:[0,0],
			topY:[0,0]
		}
	},
	/* 
	*  翻转图片
	*  @param index 传入当前被执行 inverse 操作的图片 对应的图片信息数组的index值
	*  @returns {Function} 这是一个闭包函数，其内return一个真正待被执行的函数
	**/
	inverse(index){
		return function(){
			let imgsArrangeArr = this.state.imgsArrangeArr;
			imgsArrangeArr[index] = !imgsArrangeArr[index].isInverse;
			this.setState({
				imgsArrangeArr:imgsArrangeArr
			});
		}.bind(this);
	},
	/*
   * 利用arrange函数， 居中对应index的图片
   * @param index, 需要被居中的图片对应的图片信息数组的index值
   * @returns {Function}
   */
	center(index){
		return function(){
			this.rearrange(index);
		}.bind(this);
	},
	// 组件加载完成后 初始化 每个图片组件的位置范围
	componentDidMount(){
		//首先拿到舞台的大小
		var stageDom = ReactDOM.findDOMNode(this.refs.stage),
		stageW = stageDom.scrollWidth,
		stageH = stageDom.scrollHeight,
		halfStageW = Math.ceil(stageW/2),
		halfStageH = Math.ceil(stageH/2);
		// 拿到imgFigureDow  的大小
		var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
		imgW = imgFigureDOM.scrollWidth,
		imgH = imgFigureDOM.scrollHeight,
		halfImgW = Math.ceil(imgW / 2),
		halfImgH = Math.ceil(imgH / 2);

		// 计算中心图片的位置点
		this.Constant.centerPos = {
			left:halfStageW - halfImgW,
			top:halfStageH - halfImgH
		}
		// 计算左侧，右侧区域图片排布位置的取值范围
	    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
	    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
	    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
	    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
	    this.Constant.hPosRange.y[0] = -halfImgH;
	    this.Constant.hPosRange.y[1] = stageH - halfImgH;

	    // 计算上侧区域图片排布位置的取值范围
	    this.Constant.vPosRange.topY[0] = -halfImgH;
	    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
	    this.Constant.vPosRange.x[0] = halfStageW - imgW;
	    this.Constant.vPosRange.x[1] = halfStageW;
	    this.rearrange(0);
	},
	/*
   * 重新布局所有图片
   * @param centerIndex 指定居中排布哪个图片
   */
	rearrange(centerIndex){
		var imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random() * 2),    // 取一个或者不取 （主要用于在舞台上方取图）
        topImgSpliceIndex = 0,

        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

        // 首先居中 centerIndex 的图片, 居中的 centerIndex 的图片不需要旋转
        imgsArrangeCenterArr[0] = {
          pos: centerPos,
          rotate: 0,
          isCenter: true
        };

        // 取出要布局的上侧的图片信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

        //布局位于上侧的图片
        // 布局位于上侧的图片
        imgsArrangeTopArr.forEach(function (value, index) {
            imgsArrangeTopArr[index] = {
              pos: {
                  top: unit.getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                  left: unit.getRangeRandom(vPosRangeX[0], vPosRangeX[1])
              },
              rotate: unit.get30DegRandom(),
              isCenter: false
            };
        });
	},
	getInitialState () {
		return {
		    imgsArrangeArr: [
		        /*{
		            pos: {
		                left: '0',
		                top: '0'
		            },
		            rotate: 0,    // 旋转角度
		            isInverse: false,    // 图片正反面
		            isCenter: false,    // 图片是否居中
		        }*/
		    ]
		};
	},
	render() {
		let controllerUnits = [],imgFigures = [];
		let me = this;
		imageDatas.forEach(function(value,index){
			if (!me.state.imgsArrangeArr[index]) {
	            me.state.imgsArrangeArr[index] = {
	                pos: {
	                    left: 0,
	                    top: 0
	                },
	                rotate: 0,
	                isInverse: false,
	                isCenter: false
	            };
	        }
			imgFigures.push(<ImgFigure data={value} ref={'imgFigure'+index} key={index}/>);
		});

		return (
		   <section className="stage" ref="stage">
		        <section className="img-url">
		            {imgFigures}
		        </section>
		        <nav className="controller-nav">
		            {controllerUnits}
		        </nav>
		    </section>
		);
	}
});

AppComponent.defaultProps = {

}

module.exports =AppComponent;
