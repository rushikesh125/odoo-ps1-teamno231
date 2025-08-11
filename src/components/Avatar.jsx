import React, { useState } from "react";

const Avatar = ({ url }) => {
  const [imgSrc, setImgSrc] = useState(url);
  return (
    <>
      {imgSrc && (
        <img
          id="avatarButton"
          type="button"
          className="w-8 h-8 rounded-full cursor-pointer"
          src={url}
          alt="profile-img"
          onError={() => setImgSrc("../images/user-profile.jpg")}
        />
      )}
      {!imgSrc && (
        <img
          id="avatarButton"
          type="button"
          className="w-8 h-8 rounded-full cursor-pointer"
          src="../images/user-profile.jpg"
          alt="profile-img"
        />
      )}
    </>
  );
};

export default Avatar;
