"use client"
import { translate } from "@/utils/helper";
import React, { useEffect, useState } from "react";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { RiGridFill } from "react-icons/ri";


const GridCard = (props) => {
    const { total, setGrid, grid } = props;
    // const [isGrid, setIsGrid] = useState(false);

    const toggleGrid = () => {
        setGrid(!grid);
        // setIsGrid(!isGrid);
    };
    useEffect(() => {

    }, [grid])


    return (
        <div className="all-prop-toolbar">
            <div className="all-prop-toolbar-count">
                <span>{total && `${total} ${translate("propFound")}`}</span>
            </div>
            <div className="all-prop-toolbar-actions">
                <button
                    type="button"
                    onClick={() => { if (!grid) setGrid(true); }}
                    className={`all-prop-view-btn ${grid ? "active" : ""}`}
                    aria-label="Grid view"
                >
                    <RiGridFill size={22} />
                </button>
                <button
                    type="button"
                    onClick={() => { if (grid) setGrid(false); }}
                    className={`all-prop-view-btn ${!grid ? "active" : ""}`}
                    aria-label="List view"
                >
                    <AiOutlineUnorderedList size={22} />
                </button>
            </div>
        </div>
    );
};

export default GridCard;

