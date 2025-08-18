import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const { user } = useUserStore();
    const { addToCart } = useCartStore();
    const navigate = useNavigate();

    const handleAddToCart = () => {
        if (!user) {
            toast("Must login to add products to cart", { id: "login" });
            return navigate("/login");
        } else {
            addToCart(product);
            toast.success("Product added to cart", { id: "add-to-cart" });
        }
    };

    return (
        <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg h-full">
            <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl group">
                <img
                    className="object-cover w-full transition-transform duration-500 ease-out group-hover:scale-110"
                    src={product.image}
                    alt="product image"
                />
            </div>

            <div className="mt-4 px-5 pb-5 flex flex-col flex-grow">
                <h5 className="text-xl font-semibold tracking-tight text-white mb-2">
                    {product.name}
                </h5>

                <div className="flex-grow"></div>

                <div className="mt-auto">
                    <div className="mb-4 flex items-center justify-between">
                        <p>
                            <span className="text-3xl font-bold text-emerald-400">
                                ${product.price}
                            </span>
                        </p>
                    </div>
                    <button
                        className="w-full flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
                         text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart size={22} className="mr-2" />
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ProductCard;
