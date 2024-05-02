import React from "react";

const Monitor = (props: any) => {
    const color = props.strokeColor ? props.strokeColor : 'black'
    const fill = props.fill ? props.fill : 'none'
    const scale = props.scale ? props.scale : 1

    const def_width = 800
    const def_height = 762

    const width = props.width ? props.width: def_width
    const height = props.height ? props.height : def_height
    
    const x = width * scale
    const y = height * scale
    
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            width={x} 
            height={y} 
            viewBox={`0 0 ${def_width} ${def_height}`} 
            fill='none'
        >
            <path fill-rule="evenodd" clip-rule="evenodd" d="M800 546.109V53.6081C800 23.9231 776.113 0 746.684 0H53.4257C23.9231 0 0 23.9231 0 53.6081V546.182C0 575.867 23.9231 599.9 53.4257 599.9H319.387C319.387 599.9 330.948 707.407 238.72 707.407V761.125H319.387H480.649H561.317V707.335C465.551 707.335 480.649 599.827 480.649 599.827H746.72C776.113 599.827 800 575.794 800 546.109ZM742.891 56.9996H57.1819V472.261H742.855L742.891 56.9996ZM403.629 488.052C429.083 488.052 449.724 508.657 449.724 534.111C449.724 559.566 429.12 580.243 403.629 580.243C378.101 580.243 357.46 559.566 357.46 534.111C357.46 508.657 378.137 488.052 403.629 488.052ZM404.103 505.265C388.276 505.265 375.475 518.102 375.475 533.892C375.475 549.683 388.312 562.52 404.103 562.52C419.893 562.52 432.73 549.683 432.73 533.892C432.73 518.102 419.93 505.265 404.103 505.265Z" fill={fill}/>  
        </svg>
    )
}

export default Monitor