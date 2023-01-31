import Header from "./Header";
import ProductCard from "./productCart";
import styles from "@/styles/Home.module.css";
import axios from "axios";

export const getStaticProps = async () => {
  const { data } = await axios.get(
    `https://api.tjori.com/api/v7filters/na/women-all-products/?f_page=1&format=json`
  );

  return {
    props: {
      data,
    },
  };
};

export default function Home(props) {
  return (
    <>
      <Header />
      <div className={styles.home}>
        {props.data.data.products.map((i) => (
          <ProductCard
            key={i.id}
            image={i.plpimaage}
            name={i.name}
            price={i.price}
          />
        ))}
      </div>
    </>
  );
}
