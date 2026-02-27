// Components/ZameenPropertyCard.jsx
"use client";
import React from "react";
import { Card } from "react-bootstrap";
import Image from "next/image";
import { truncate, placeholderImage } from "@/utils/helper";

const AllPropertyCardAI = ({ property }) => {
  const {
    title,
    price,
    location,
    area,
    beds,
    baths,
    link,
    image,
    added,
    propertyType,
  } = property;

  const isPlot = propertyType === "plot";
  const isHouseOrFlat = propertyType === "house" || propertyType === "flat";

  // Plot ke liye sirf area dikhana hai
  let featureItems = [];

  if (isPlot) {
    if (area) featureItems.push({ label: "Area", value: area });
  } else if (isHouseOrFlat) {
    if (beds) featureItems.push({ label: "Beds", value: beds });
    if (baths) featureItems.push({ label: "Baths", value: baths });
    if (area) featureItems.push({ label: "Area", value: area });
  } else {
    // other categories (agar kabhi aaye) ke liye simple fallback
    if (area) featureItems.push({ label: "Area", value: area });
  }

  featureItems = featureItems.slice(0, 3);

  return (
    <Card id="all_prop_main_card" className="row">
      <div className="col-md-4 img_div" id="all_prop_main_card_rows_cols">
        {image ? (
          <Image
            loading="lazy"
            className="card-img"
            id="all_prop_card_img"
            src={image}
            alt={title}
            width={400}
            height={300}
            onError={placeholderImage}
          />
        ) : (
          <div className="card-img" id="all_prop_card_img">
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="col-md-8" id="all_prop_main_card_rows_cols">
        <Card.Body id="all_prop_card_body">
          <div className="first_div">
            <div id="sub_body_middletext">
              <span>{truncate(title, 60)}</span>
              <p>{added ? truncate(added, 30) : ""}</p>
            </div>
          </div>

          {featureItems.length > 0 && (
            <div className="category_params">
              <div className="row">
                {featureItems.map((item, index) => (
                  <div className="col-lg-3 parmas_div" key={index}>
                    <div className="cat_content">
                      <div className="param_name">
                        <span>{truncate(item.value, 18)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Card.Footer
            id="all_prop_card_footer"
            style={{ height: featureItems.length > 0 ? "auto" : "120px" }}
          >
            {price && (
              <span className="price_tag">
                <span>{price}</span>
              </span>
            )}

            {link && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="details-btn ms-2"
              >
                View on Zameen
              </a>
            )}
          </Card.Footer>
        </Card.Body>
      </div>
    </Card>
  );
};

export default AllPropertyCardAI;