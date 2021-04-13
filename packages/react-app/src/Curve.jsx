import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
const Curve = (props) => {
  let ref = useRef();
  const isDarkMode=useSelector((state)=>state.isDark)
  useEffect(() => {
    let canvas = ref.current;
    const textSize = 16

    const width = canvas.width ;
    const height = canvas.height ;

    if (canvas.getContext && props.ethReserve && props.tokenReserve) {
        if (typeof props.ethReserve === 'undefined' && typeof props.tokenReserve === 'undefined' && props.tokenReserve !== '0.000'){
            const invalidContractBalance = 'true';
            } else {    
          
      const k = props.ethReserve * props.tokenReserve

      // console.log("CurveBNB ",props.ethReserve)
      // console.log("CorrectBNBBalance ",props.bnbFinal)

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,width,height);

      let maxX = k/(props.ethReserve/4)
      let minX = 0

      if(props.addingEth||props.addingToken){
        maxX = k/(props.ethReserve*0.4)
        //maxX = k/(props.ethReserve*0.8)
        minX = k/Math.max(0,(500-props.ethReserve))
      }

      const maxY = maxX * height / width;
      const minY = minX * height / width;

      const plotX = (x)=>{
        return (x - minX) / (maxX - minX) * width ;
      }

      const plotY = (y)=>{
        return height - (y - minY) / (maxY - minY) * height ;
      }
      ctx.strokeStyle = isDarkMode?"whitesmoke":"gray"
      ctx.fillStyle = isDarkMode?"whitesmoke":"gray"
      ctx.font = textSize+"px Arial";
      // +Y axis
      ctx.beginPath() ;
      ctx.moveTo(plotX(minX),plotY(0)) ;
      ctx.lineTo(plotX(minX),plotY(maxY)) ;
      ctx.stroke() ;
      // +X axis
      ctx.beginPath() ;
      ctx.moveTo(plotX(0),plotY(minY)) ;
      ctx.lineTo(plotX(maxX),plotY(minY)) ;
      ctx.stroke() ;

      ctx.lineWidth = 2 ;
      ctx.beginPath() ;
      let first = true
      for (var x = minX; x <= maxX; x += maxX/width) {
        /////
        var y = k / x
        /////
        if (first) {
          ctx.moveTo(plotX(x),plotY(y))
          first = false
        } else {
          ctx.lineTo(plotX(x),plotY(y))
        }
      }
      ctx.stroke() ;

      ctx.lineWidth = 1 ;

      if(props.addingEth){

        let newEthReserve = props.ethReserve + parseFloat(props.addingEth)

        ctx.fillStyle = isDarkMode?"whitesmoke":"gray"
        ctx.beginPath();
        ctx.arc(plotX(newEthReserve),plotY(k/(newEthReserve)), 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#009900";
        drawArrow(ctx,plotX(props.ethReserve),plotY(props.tokenReserve),plotX(newEthReserve),plotY(props.tokenReserve))

        ctx.fillStyle = isDarkMode?"whitesmoke":"gray"
        ctx.fillText(""+props.addingEth+" BNB input", plotX(props.ethReserve)+textSize, plotY(props.tokenReserve)-textSize);

        ctx.strokeStyle = "#990000";
        drawArrow(ctx,plotX(newEthReserve),plotY(props.tokenReserve),plotX(newEthReserve),plotY(k/(newEthReserve)))

        let amountGained =  Math.round(10000 * ( props.addingEth * props.tokenReserve ) / ( newEthReserve ) ) /10000
        ctx.fillStyle = isDarkMode?"whitesmoke":"gray"
        ctx.fillText(""+(amountGained)+" 🌍 output (-0.3% fee)", plotX(newEthReserve)+textSize,plotY(k/(newEthReserve)));

      }else if(props.addingToken){

        let newTokenReserve = props.tokenReserve + parseFloat(props.addingToken)

        ctx.fillStyle = isDarkMode?"whitesmoke":"gray"
        ctx.beginPath();
        ctx.arc(plotX(k/(newTokenReserve)),plotY(newTokenReserve), 5, 0, 2 * Math.PI);
        ctx.fill();

        //console.log("newTokenReserve",newTokenReserve)
        ctx.strokeStyle = "#990000";
        drawArrow(ctx,plotX(props.ethReserve),plotY(props.tokenReserve),plotX(props.ethReserve),plotY(newTokenReserve))

        ctx.fillStyle = isDarkMode?"whitesmoke":"gray"
        ctx.fillText(""+(props.addingToken)+" 🌍 input", plotX(props.ethReserve)+textSize,plotY(props.tokenReserve));

        ctx.strokeStyle = "#009900";
        drawArrow(ctx,plotX(props.ethReserve),plotY(newTokenReserve),plotX(k/(newTokenReserve)),plotY(newTokenReserve))

        let amountGained =  Math.round(10000 * ( props.addingToken * props.ethReserve ) / ( newTokenReserve ) ) /10000
        //console.log("amountGained",amountGained)
        ctx.fillStyle =isDarkMode?"whitesmoke":"gray"
        ctx.fillText(""+amountGained+" BNB output (-0.3% fee)", plotX(k/(newTokenReserve))+textSize,plotY(newTokenReserve)-textSize);

      }

      ctx.fillStyle = "#0000FF"
      ctx.beginPath();
      ctx.arc(plotX(props.ethReserve),plotY(props.tokenReserve), 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    }
  },[   props.addingEth,
    props.addingToken,
    props.tokenReserve,  ]);
 
  console.log(
    props.addingEth,
    props.addingToken,
    props.ethReserve,
    props.tokenReserve,
  );

  return (
    <StyledCurve style={{margin:32,position:'relative',width:props.width,height:props.height}} isDarkMode={isDarkMode}>
      <canvas
        style={{position:'absolute',left:0,top:0}}
        ref={ref}
        {...props}
      />
      <div style={{position:'absolute',left:"20%",bottom:-20}} className="y">
        -- BNB Reserve --
      </div>
      <div className="x" style={{position:'absolute',left:-20,bottom:"20%",transform:"rotate(-90deg)",transformOrigin:"0 0"}}>
        -- Token Reserve --
      </div>
    </StyledCurve>
  );
};

const StyledCurve=styled.div`
color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
canvas{
  color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
}
`


export default Curve;


const drawArrow = (ctx,x1,y1,x2,y2)=>{
  let [dx,dy] = [x1-x2, y1-y2]
  let norm = Math.sqrt(dx * dx + dy * dy)
  let [udx, udy] = [dx/norm, dy/norm]
  const size = norm/7
  ctx.beginPath();
  ctx.moveTo(x1,y1) ;
  ctx.lineTo(x2,y2) ;
  ctx.stroke() ;
  ctx.moveTo(x2,y2) ;
  ctx.lineTo(x2 + udx*size - udy*size,y2 + udx*size + udy*size ) ;
  ctx.moveTo(x2,y2) ;
  ctx.lineTo(x2 + udx*size +udy*size ,y2 - udx*size + udy*size) ;
  ctx.stroke() ;
}
