import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X, Filter, Search } from "lucide-react";
import { useGetAllBrandsQuery } from "@/redux/api/productApi";

interface SidebarProps {
  price: number[];
  ratings: number;
  discount: number;
  brand: string;
  priceHandler: (e: Event | null, newPrice: number | number[]) => void;
  handleCheckboxChange: (value: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxPrice: (value: number[], event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChangeDis: (value: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBrandClick: (brandId: string) => void;
  clearAllFilters: () => void;
  clearPriceFilters: () => void;
  clearRatingFilters: () => void;
  clearDiscountFilters: () => void;
  clearBrandFilters: () => void;
}

const priceRanges = [
  [0, 500],
  [500, 1000],
  [1000, 5000],
  [5000, 10000],
  [10000, 50000],
];
const discounts = [10, 20, 30, 40, 50];
const ratingsList = [4, 3, 2, 1];

const Sidebar: React.FC<SidebarProps> = ({
  price,
  ratings,
  discount,
  brand,
  priceHandler,
  handleCheckboxChange,
  handleCheckboxPrice,
  handleCheckboxChangeDis,
  handleBrandClick,
  clearAllFilters,
  clearPriceFilters,
  clearRatingFilters,
  clearDiscountFilters,
  clearBrandFilters,
}) => {
  const displayMin = Array.isArray(price) && typeof price[0] === "number" ? price[0] : 0;
  const displayMax = Array.isArray(price) && typeof price[1] === "number" ? price[1] : 100000;

  const { data: brands = [], isLoading: brandsLoading } = useGetAllBrandsQuery();

  const [openBrand, setOpenBrand] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openDiscount, setOpenDiscount] = useState(true);
  const [openRatings, setOpenRatings] = useState(true);
  const [brandSearch, setBrandSearch] = useState("");

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [tempPrice, setTempPrice] = useState<number[]>(price);
  const [tempRatings, setTempRatings] = useState<number>(ratings);
  const [tempDiscount, setTempDiscount] = useState<number>(discount);
  const [tempBrand, setTempBrand] = useState<string>(brand);

  const filteredBrands = brands.filter((b: any) =>
    b.name?.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const hasChanges = () =>
    tempPrice[0] !== price[0] ||
    tempPrice[1] !== price[1] ||
    tempRatings !== ratings ||
    tempDiscount !== discount ||
    tempBrand !== brand;

  const applyMobileFilters = () => {
    priceHandler(null, tempPrice);
    if (tempRatings !== ratings) {
      handleCheckboxChange(tempRatings, { target: { checked: tempRatings > 0 } } as React.ChangeEvent<HTMLInputElement>);
    }
    if (tempDiscount !== discount) {
      handleCheckboxChangeDis(tempDiscount, { target: { checked: tempDiscount > 0 } } as React.ChangeEvent<HTMLInputElement>);
    }
    if (tempBrand !== brand) {
      handleBrandClick(tempBrand);
    }
    setIsMobileOpen(false);
  };

  const resetTempFilters = () => {
    setTempPrice(price);
    setTempRatings(ratings);
    setTempDiscount(discount);
    setTempBrand(brand);
  };

  const clearAllMobileFilters = () => {
    setTempPrice([0, 100000]);
    setTempRatings(0);
    setTempDiscount(0);
    setTempBrand("");
  };

  const SectionHeader = ({
    title,
    open,
    toggle,
    clear,
    isMobile = false,
  }: {
    title: string;
    open: boolean;
    toggle: () => void;
    clear?: () => void;
    isMobile?: boolean;
  }) => (
    <div className="flex items-center justify-between mb-2 cursor-pointer select-none" onClick={toggle}>
      <h3 className="font-semibold text-sm text-gray-800 dark:text-slate-200 flex-shrink-0">{title}</h3>
      <div className="flex items-center gap-2 flex-shrink-0">
        {clear && !isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-2 py-0.5 h-auto text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
          >
            Clear
          </Button>
        )}
        {open ? <ChevronUp size={14} className="text-gray-500 dark:text-slate-400" /> : <ChevronDown size={14} className="text-gray-500 dark:text-slate-400" />}
      </div>
    </div>
  );

  // Shared Brand Filter UI
  const BrandFilterContent = ({
    selectedBrand,
    onBrandClick,
  }: {
    selectedBrand: string;
    onBrandClick: (id: string) => void;
  }) => (
    <div className="mt-2">
      {/* Search within brands */}
      {brands.length > 6 && (
        <div className="relative mb-2">
          <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-200 rounded pl-7 pr-3 py-1.5 focus:outline-none focus:border-blue-400"
          />
        </div>
      )}
      {brandsLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">No brands found</p>
      ) : (
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {filteredBrands.map((b: any) => {
            const isActive = selectedBrand === b._id;
            return (
              <label key={b._id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
                  checked={isActive}
                  onChange={() => onBrandClick(isActive ? "" : b._id)}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {b.logo?.url && (
                    <img
                      src={b.logo.url}
                      alt={b.name}
                      className="w-5 h-5 object-contain rounded flex-shrink-0"
                    />
                  )}
                  <span className={`text-sm truncate ${isActive ? "font-semibold text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-slate-100"}`}>
                    {b.name}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  const DesktopSidebarContent = () => (
    <div className="w-full h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">Filters</h2>
        <button
          onClick={clearAllFilters}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Brand Section */}
      <div className="mb-5 pb-5 border-b border-gray-100 dark:border-slate-800">
        <SectionHeader title="Brand" open={openBrand} toggle={() => setOpenBrand(!openBrand)} clear={clearBrandFilters} />
        {openBrand && (
          <BrandFilterContent selectedBrand={brand} onBrandClick={handleBrandClick} />
        )}
      </div>

      {/* Price Section */}
      <div className="mb-5 pb-5 border-b border-gray-100 dark:border-slate-800">
        <SectionHeader title="Price" open={openPrice} toggle={() => setOpenPrice(!openPrice)} clear={clearPriceFilters} />
        {openPrice && (
          <div className="mt-2">
            <div className="px-1 mb-3">
              <Slider
                defaultValue={price}
                min={0}
                max={100000}
                step={500}
                onValueChange={(val) => priceHandler(null, val)}
              />
            </div>
            <div className="text-xs font-semibold text-center text-gray-700 dark:text-slate-300 mb-3">
              ₹{displayMin.toLocaleString()} – ₹{displayMax.toLocaleString()}
            </div>
            <div className="space-y-1.5">
              {priceRanges.map((range) => (
                <label key={range.join("-")} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
                    checked={Array.isArray(price) && price[0] === range[0] && price[1] === range[1]}
                    onChange={(e) => handleCheckboxPrice(range, e)}
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-slate-100">
                    ₹{range[0].toLocaleString()} – ₹{range[1].toLocaleString()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ratings Section */}
      <div className="mb-4">
        <SectionHeader title="Customer Ratings" open={openRatings} toggle={() => setOpenRatings(!openRatings)} clear={clearRatingFilters} />
        {openRatings && (
          <div className="mt-2 space-y-1.5">
            {ratingsList.map((rate) => (
              <label key={rate} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
                  checked={ratings === rate}
                  onChange={(e) => handleCheckboxChange(rate, e)}
                />
                <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-slate-100">
                  {"★".repeat(rate)}{"☆".repeat(4 - rate)} & above
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Discount Section */}
      <div className="mb-5 pb-5 border-b border-gray-100 dark:border-slate-800">
        <SectionHeader title="Discount" open={openDiscount} toggle={() => setOpenDiscount(!openDiscount)} clear={clearDiscountFilters} />
        {openDiscount && (
          <div className="mt-2 space-y-1.5">
            {discounts.map((dis) => (
              <label key={dis} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
                  checked={discount === dis}
                  onChange={(e) => handleCheckboxChangeDis(dis, e)}
                />
                <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-slate-100">{dis}% or more</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between mb-4 flex-shrink-0 px-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">Filters</h2>
        <div className="flex items-center gap-2">
          <button onClick={clearAllMobileFilters} className="text-xs text-blue-600 font-medium">
            Clear All
          </button>
          <button onClick={() => { resetTempFilters(); setIsMobileOpen(false); }} className="p-1 text-gray-500 hover:text-gray-800">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 divide-y divide-gray-100 dark:divide-slate-800 px-4">
        {/* Brand */}
        <div className="pb-4">
          <SectionHeader title="Brand" open={openBrand} toggle={() => setOpenBrand(!openBrand)} isMobile />
          {openBrand && (
            <BrandFilterContent selectedBrand={tempBrand} onBrandClick={(id) => setTempBrand(id)} />
          )}
        </div>

        {/* Price */}
        <div className="pt-4 pb-4">
          <SectionHeader title="Price" open={openPrice} toggle={() => setOpenPrice(!openPrice)} isMobile />
          {openPrice && (
            <div className="mt-2">
              <div className="px-1 mb-3">
                <Slider
                  defaultValue={tempPrice}
                  min={0}
                  max={100000}
                  step={500}
                  onValueChange={(val) => setTempPrice(val)}
                />
              </div>
              <div className="text-xs font-semibold text-center text-gray-700 dark:text-slate-300 mb-3">
                ₹{tempPrice[0].toLocaleString()} – ₹{tempPrice[1].toLocaleString()}
              </div>
              <div className="space-y-1.5">
                {priceRanges.map((range) => (
                  <label key={range.join("-")} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
                      checked={tempPrice[0] === range[0] && tempPrice[1] === range[1]}
                      onChange={(e) => {
                        if (e.target.checked) setTempPrice(range);
                        else setTempPrice([0, 100000]);
                      }}
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">₹{range[0].toLocaleString()} – ₹{range[1].toLocaleString()}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Discount */}
        <div className="pt-4 pb-4">
          <SectionHeader title="Discount" open={openDiscount} toggle={() => setOpenDiscount(!openDiscount)} isMobile />
          {openDiscount && (
            <div className="mt-2 space-y-1.5">
              {discounts.map((dis) => (
                <label key={dis} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
                    checked={tempDiscount === dis}
                    onChange={(e) => { if (e.target.checked) setTempDiscount(dis); else setTempDiscount(0); }}
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">{dis}% or more</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Ratings */}
        <div className="pt-4">
          <SectionHeader title="Customer Ratings" open={openRatings} toggle={() => setOpenRatings(!openRatings)} isMobile />
          {openRatings && (
            <div className="mt-2 space-y-1.5">
              {ratingsList.map((rate) => (
                <label key={rate} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
                    checked={tempRatings === rate}
                    onChange={(e) => { if (e.target.checked) setTempRatings(rate); else setTempRatings(0); }}
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {"★".repeat(rate)}{"☆".repeat(4 - rate)} & above
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apply Footer */}
      {hasChanges() && (
        <div className="flex-shrink-0 pt-4 px-4 border-t border-gray-100 dark:border-slate-800">
          <Button
            onClick={applyMobileFilters}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg"
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter FAB */}
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => { resetTempFilters(); setIsMobileOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-3"
        >
          <Filter size={16} />
          Filters
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => { resetTempFilters(); setIsMobileOpen(false); }}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 min-w-[240px] border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 h-fit sticky top-4 overflow-hidden shadow-sm rounded-sm">
        <div className="p-4">
          <DesktopSidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside className={`
        md:hidden fixed top-0 left-0 h-full w-[320px] max-w-[85vw] bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-hidden
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-full p-4">
          <MobileSidebarContent />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;