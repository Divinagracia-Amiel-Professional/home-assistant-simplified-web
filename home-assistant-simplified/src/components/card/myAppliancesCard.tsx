import React from "react";

const MyApplianceCard = (props: any) => {
    const icon = props.icon ? props.icon : null

    return(
        <div
            className='appliance-card'
        >
            <div
                className='icon'
            >

            </div>
            <div
                className='details'
            >

            </div>
        </div>
    )
}

export default MyApplianceCard