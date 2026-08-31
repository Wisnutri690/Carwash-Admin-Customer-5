const VEHICLE_IMAGES: Record<string, string> = {
  "taycan": "/assets/cars/porsche_taycan.jpg",
  "911": "/assets/cars/porsche_911.jpg",
  "gt3": "/assets/cars/porsche_911.jpg",
  "porsche": "/assets/cars/porsche_911.jpg",
  "sf90": "/assets/cars/ferrari_sf90.jpg",
  "roma": "/assets/cars/ferrari_sf90.jpg",
  "ferrari": "/assets/cars/ferrari_sf90.jpg",
  "huracan": "/assets/cars/lamborghini_huracan.jpg",
  "urus": "/assets/cars/lamborghini_huracan.jpg",
  "lambo": "/assets/cars/lamborghini_huracan.jpg",
  "lamborghini": "/assets/cars/lamborghini_huracan.jpg",
  "720s": "/assets/cars/mclaren_720s.jpg",
  "mclaren": "/assets/cars/mclaren_720s.jpg",
  "m4": "/assets/cars/bmw_m4.jpg",
  "m8": "/assets/cars/bmw_m4.jpg",
  "bmw": "/assets/cars/bmw_m4.jpg",
  "gt-r": "/assets/cars/nissan_gtr.jpg",
  "gtr": "/assets/cars/nissan_gtr.jpg",
  "nissan": "/assets/cars/nissan_gtr.jpg",
};

const DEFAULT_IMAGE = "/assets/cars/porsche_911.jpg";

export const getVehicleImage = (brand: string = "", model: string = ""): string => {
  const target = `${brand} ${model}`.toLowerCase();

  for (const [key, url] of Object.entries(VEHICLE_IMAGES)) {
    if (target.includes(key)) {
      return url;
    }
  }

  return DEFAULT_IMAGE;
};
