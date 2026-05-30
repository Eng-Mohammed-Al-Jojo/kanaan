
export default function MenuSkeleton() {
  const categories = [1, 2];

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* Search Bar Skeleton */}
      <div className="w-full max-w-2xl mx-auto mb-8 animate-pulse">
        <div className="h-16 w-full bg-cream/40 rounded-full border border-primary/10 shadow-soft" />
      </div>

      {/* Tabs / Navigation Skeleton */}
      <div className="flex gap-3 overflow-hidden pb-8 no-scrollbar snap-x animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 w-28 bg-cream/30 rounded-full shrink-0 border border-primary/5" />
        ))}
      </div>

      {/* Categories Sections */}
      <div className="space-y-12">
        {categories.map((cat) => (
          <div key={cat} className="space-y-6">

            {/* Section Header */}
            <div className="flex flex-col items-center gap-4 py-8 relative animate-pulse">
              <div className="h-8 w-1/3 bg-primary/10 rounded-xl" />
              <div className="mt-4 flex items-center gap-4">
                <div className="w-12 h-1 bg-primary/10" />
                <div className="w-2 h-2 rounded-full bg-primary/25" />
                <div className="w-12 h-1 bg-primary/10" />
              </div>
            </div>

            {/* Rows List - Matching ItemRow layout exactly */}
            <div className="flex flex-col w-full overflow-hidden shadow-soft border border-primary/5 rounded-[2rem] bg-cream/20 divide-y divide-secondary/5 animate-pulse">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="relative flex items-center justify-between w-full px-5 py-5 min-h-[88px]"
                >
                  {/* RIGHT SIDE: NAME + DESCRIPTION SKELETON */}
                  <div className="flex-1 text-right pr-1 space-y-2.5">
                    <div className="h-5 w-2/5 bg-primary/15 rounded-full ml-auto" />
                    <div className="h-3.5 w-3/5 bg-primary/5 rounded-full ml-auto" />
                  </div>

                  {/* LEFT SIDE: PRICE + ORDER BUTTON SKELETON */}
                  <div className="flex flex-col items-end shrink-0 min-w-[110px] gap-2.5">
                    <div className="h-5 w-12 bg-primary/15 rounded-full" />
                    <div className="h-7 w-20 bg-primary/20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
