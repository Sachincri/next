import React from "react";
import { BiSearch } from "react-icons/bi";
import { RiUser3Line } from "react-icons/ri";
import { FiBookmark } from "react-icons/fi";
import { AiOutlineShopping } from "react-icons/ai";
import styles from "@/styles/Header.module.css";
import {
  GiAmpleDress,
  GiTravelDress,
  GiDress,
  GiLargeDress,
  GiDiscGolfBag,
  GiGymBag,
  GiSchoolBag,
} from "react-icons/gi";
import { SlHandbag } from "react-icons/sl";

const Header = () => {
  return (
    <>
      <nav className={styles.navbar}>
        <h4>T A N N T R I M</h4>
        <div>
          <BiSearch />
          <RiUser3Line />
          <FiBookmark />
          <AiOutlineShopping />
        </div>
      </nav>
      <nav className={styles.navbar2}>
        <div>Bags</div>
        <div>Travel</div>
        <div>Accesoies</div>
        <div>Gifting</div>
        <div>Jewelery</div>
      </nav>
      <nav className={styles.navbar3}>
        <div>
          <GiAmpleDress />
        </div>
        <div>
          <GiDress />
        </div>
        <div>
          <GiLargeDress />
        </div>
        <div>
          <GiTravelDress />
        </div>
        <div>
          <GiDiscGolfBag />
        </div>
        <div>
          <GiSchoolBag />
        </div>
        <div>
          <SlHandbag />
        </div>
        <div>
          <GiGymBag />
        </div>
      </nav>
    </>
  );
};

export default Header;
