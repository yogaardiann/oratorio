import React from "react";
import "./destination-section.css";

function DestinationCard({ imageSrc, name, location, description }) {
  return (
    <div className="destination-card">
      <img src={imageSrc} alt={name} className="card-image" />
      <div className="card-overlay"></div>

      <h3 className="card-name">{name}</h3>
      {location && <p className="card-location">{location}</p>}
      {description && <p className="card-description">{description}</p>}
    </div>
  );
}

export default DestinationCard;
