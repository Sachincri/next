import { TfiBookmark } from "react-icons/tfi";
import { AiOutlineShopping } from "react-icons/ai";
import styles from "@/styles/productCard.module.css";

const productCard = ({ name, price, image }) => {
  return (
    <div className={styles.productcard}>
      <p>
        <TfiBookmark />
      </p>
      <img src={image} alt={name} />
      <p>{name}</p>
      <div>
        <p>₹ {price}</p>
        <button>
          <AiOutlineShopping />
        </button>
      </div>
    </div>
  );
};

export default productCard;
