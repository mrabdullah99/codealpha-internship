import { useSelector } from "react-redux";
import ProductCard from "../productCard/ProductCard";
import { useSearchParams } from "react-router-dom";

const AllProducts = () => {
  const products = useSelector((state) => state.products.list);

  const [searchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") || "";
  const filteredProducts = products.filter((product) =>
    searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );
  return (
    <div className="max-w-5xl mx-auto md:mx-auto flex flex-col pt-14">
      <p className="text-3xl font-medium">
        {" "}
        {searchTerm ? `Search results for "${searchTerm}"` : "All products"}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-gray-500 text-center">
            No products found
          </p>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
