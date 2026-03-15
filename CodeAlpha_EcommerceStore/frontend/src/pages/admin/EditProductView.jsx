import { useState, useEffect } from "react";
import { Package, Save, Upload, X, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axiosConfig.js";

const EditProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    stock: "",
    brand: "",
    color: "",
    category: "",
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Sports",
    "Headphone",
    "Books",
    "Toys",
    "Beauty",
    "Other",
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/products/${id}`);
        const product = response.data.product || response.data;

        setFormData({
          name: product.name,
          price: product.price,
          originalPrice: product.offerPrice || "",
          description: product.description,
          stock: product.stock,
          brand: product.brand || "",
          color: product.color || "",
          category: product.category,
        });

        if (product.images && product.images.length > 0) {
          const existingImgs = product.images.map((url, index) => ({
            id: `existing-${index}`,
            url,
            name: url,
            isExisting: true,
          }));
          setImages(existingImgs);
          setExistingImages(product.images);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (id) => {
    const imgToRemove = images.find((img) => img.id === id);

    if (imgToRemove.isExisting) {
      setExistingImages((prev) =>
        prev.filter((name) => name !== imgToRemove.name),
      );
    } else {
      setImageFiles((prev) =>
        prev.filter((file) => file.name !== imgToRemove.name),
      );
    }

    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (existingImages.length === 0 && imageFiles.length === 0) {
      setError("Please upload at least one product image");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You must be logged in as admin");
        setSaving(false);
        return;
      }

      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", parseFloat(formData.price));
      data.append(
        "originalPrice",
        formData.originalPrice ? parseFloat(formData.originalPrice) : "",
      );
      data.append("stock", parseInt(formData.stock));
      data.append("brand", formData.brand);
      data.append("color", formData.color);
      data.append("category", formData.category);

      existingImages.forEach((url) => {
        data.append("existingImages", url);
      });

      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      const response = await axios.put(`/products/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Product updated:", response.data);
      setSuccess(true);

      setTimeout(() => {
        navigate("/admin/all-products");
      }, 500);
    } catch (err) {
      console.error("Error updating product:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/admin/all-products")}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeft size={20} />
        Back to Products
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        <p className="text-gray-500 mt-1">Update product details</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <Package size={20} className="text-green-600" />
          <span>Product updated successfully! Redirecting...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle size={20} className="text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images *
            </label>
            <div className="flex flex-wrap gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Bose, Sony"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g. Black, White"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sale Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="originalPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Original Price ($)
              </label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stock Qty *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/all-products")}
              disabled={saving}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductView;
