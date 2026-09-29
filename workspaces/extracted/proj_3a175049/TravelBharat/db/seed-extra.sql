-- ============================================================
-- TravelBharat Extended Seed Data
-- Adds broader destination coverage using state-name lookups
-- ============================================================

INSERT INTO destinations (state_id, name, location, category, description, image_url, entry_fee, best_time, rating)
SELECT s.id, v.name, v.location, v.category, v.description, v.image_url, v.entry_fee, v.best_time, v.rating
FROM (
  VALUES
    ('Andhra Pradesh','Tirupati','Tirupati','Religious','One of the most visited pilgrimage destinations in the world, famous for Lord Venkateswara Temple.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tirumala_090615.jpg/1200px-Tirumala_090615.jpg','Free darshan, special tickets available','Sep-Mar',4.8),
    ('Arunachal Pradesh','Tawang Monastery','Tawang','Religious','A dramatic Himalayan monastery perched above valleys and snow-lined roads near the Bhutan border.','https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/TawangMonastery-ArunachalPradesh-1.jpg/1200px-TawangMonastery-ArunachalPradesh-1.jpg','Free','Mar-May, Sep-Oct',4.7),
    ('Bihar','Bodh Gaya','Gaya','Religious','Sacred Buddhist site where Gautama Buddha is believed to have attained enlightenment.','https://upload.wikimedia.org/wikipedia/commons/e/e6/Mahabodhi_temple_complex%2C_Bodhgaya_27.jpg','Free','Oct-Mar',4.8),
    ('Chhattisgarh','Chitrakote Falls','Jagdalpur','Nature','Often called the Niagara of India, this broad waterfall is at its best during and after the monsoon.','https://upload.wikimedia.org/wikipedia/commons/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg','Free','Jul-Feb',4.6),
    ('Gujarat','Rann of Kutch','Kutch','Nature','A surreal white salt desert that turns magical during the Rann Utsav season.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Rani_ki_vav_02.jpg/1200px-Rani_ki_vav_02.jpg','Festival pass varies','Nov-Feb',4.8),
    ('Haryana','Kurukshetra','Kurukshetra','Heritage','Historic landscape tied to the Mahabharata, dotted with sacred tanks, museums, and temples.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Cyber_City_View.jpg/1200px-Cyber_City_View.jpg','Free','Oct-Mar',4.3),
    ('Jharkhand','Hundru Falls','Ranchi','Nature','A powerful cascade near Ranchi surrounded by forested viewpoints and rocky steps.','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Views_of_Shikharji_on_way_to_Anantnatha_Tonk_3.jpg/1200px-Views_of_Shikharji_on_way_to_Anantnatha_Tonk_3.jpg','Minimal parking fee','Aug-Feb',4.4),
    ('Maharashtra','Ajanta Caves','Aurangabad','Heritage','Ancient Buddhist cave monuments famed for murals, sculptures, and rock-cut architecture.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Cave_26%2C_Ajanta.jpg/1200px-Cave_26%2C_Ajanta.jpg','INR 40 Indians, INR 600 foreigners','Nov-Mar',4.8),
    ('Manipur','Loktak Lake','Bishnupur','Nature','A shimmering lake known for floating phumdis and serene boating experiences near Imphal.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_%28edit%29.jpg/1200px-Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_%28edit%29.jpg','Free','Oct-Mar',4.6),
    ('Meghalaya','Living Root Bridge','Cherrapunji','Adventure','A rainforest trail experience to naturally grown root bridges shaped over generations.','https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg/1200px-Dawki_River%2C_Meghalaya%2C_India.jpg','Guide costs extra','Oct-Apr',4.8),
    ('Mizoram','Phawngpui Peak','Lawngtlai','Adventure','Blue Mountain trek with panoramic hill views, orchids, and cool highland air.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Embossed_Figures_Kawtchhuah_Ropui_Vangchhia_Mapuia_Hnamte_%281%29.JPG/1200px-Embossed_Figures_Kawtchhuah_Ropui_Vangchhia_Mapuia_Hnamte_%281%29.JPG','Permit required','Oct-Apr',4.5),
    ('Nagaland','Dzuko Valley','Kohima','Adventure','A high-altitude valley known for seasonal flowers, ridge treks, and breathtaking camping views.','https://upload.wikimedia.org/wikipedia/commons/c/cb/Kapamodzu.jpg','Entry fee nominal','Oct-May',4.8),
    ('Odisha','Konark Sun Temple','Konark','Heritage','The iconic chariot-shaped temple and UNESCO site famed for sculpture and architectural detail.','https://upload.wikimedia.org/wikipedia/commons/0/0d/Brahmeswar_Temple%2C_Bhubaneswar.JPG','INR 40 Indians, INR 600 foreigners','Oct-Feb',4.7),
    ('Punjab','Golden Temple','Amritsar','Religious','Amritsar''s spiritual center known for its gold-clad sanctum, langar, and serene sarovar.','https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Golden_Temple%2C_Amritsar%2C_Punjab_UNAG.jpg/1200px-Golden_Temple%2C_Amritsar%2C_Punjab_UNAG.jpg','Free','Oct-Mar',4.9),
    ('Sikkim','Tsomgo Lake','Gangtok','Nature','A high-altitude glacial lake outside Gangtok surrounded by snow peaks and winding mountain roads.','https://upload.wikimedia.org/wikipedia/commons/f/f9/Buddha_statue_at_Buddha_Park_of_Ravangla%2C_Sikkim%2C_India_%281%29.jpg','Permit and taxi charges apply','Mar-May, Oct-Dec',4.7),
    ('Telangana','Charminar','Hyderabad','Heritage','Hyderabad''s landmark monument at the heart of the old city, framed by bazaars and street food.','https://upload.wikimedia.org/wikipedia/commons/f/f7/A_typical_charminar_evening.jpg','INR 25 Indians','Oct-Feb',4.6),
    ('Tripura','Neermahal','Melaghar','Heritage','A stunning lake palace blending Mughal and Hindu design in the middle of Rudrasagar Lake.','https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Tripura_State_Museum_Agartala_Tripura_India.jpg/1200px-Tripura_State_Museum_Agartala_Tripura_India.jpg','Boat and entry charges apply','Oct-Mar',4.4),
    ('Andaman and Nicobar Islands','Havelock Island','Swaraj Dweep','Beach','Island escape with scuba, coral reefs, quiet beaches, and crystal-clear blue water.','https://upload.wikimedia.org/wikipedia/commons/2/2f/The_Coral_Reef_at_the_Andaman_Islands.jpg','Ferry and activity costs apply','Oct-May',4.9),
    ('Chandigarh','Rock Garden','Sector 1, Chandigarh','Heritage','A whimsical sculpture garden crafted from industrial and urban waste materials.','https://upload.wikimedia.org/wikipedia/commons/7/76/Open_Hand_monument%2C_Chandigarh.jpg','INR 30 adults','Oct-Mar',4.5),
    ('Dadra and Nagar Haveli and Daman and Diu','Diu Fort','Diu','Heritage','Sea-facing Portuguese fort with bastions, canons, and dramatic coastal views.','https://upload.wikimedia.org/wikipedia/commons/5/5f/Vanganga_Garden%2C_Silvassa_%2832345632184%29.jpg','Free','Nov-Feb',4.4),
    ('Jammu and Kashmir','Gulmarg','Baramulla','Adventure','A mountain meadow destination known for skiing, cable car rides, and pine forest views.','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Pahalgam_Valley.jpg/1200px-Pahalgam_Valley.jpg','Gondola tickets extra','Dec-Mar, Apr-Jun',4.9),
    ('Lakshadweep','Agatti Island','Agatti','Beach','A postcard-perfect island with coral lagoons, water sports, and relaxed coastal stays.','https://upload.wikimedia.org/wikipedia/commons/7/72/A_beach_side_resort_at_Kadmat_Island%2C_Lakshadweep.jpg','Permit required','Oct-May',4.8),
    ('Puducherry','French Quarter','White Town, Puducherry','Heritage','Charming streets, heritage facades, seaside cafes, and a distinctly colonial atmosphere.','https://commons.wikimedia.org/wiki/Special:FilePath/Pondicherry_shoreline.jpg?width=1200','Free','Oct-Feb',4.7),
    ('Maharashtra','Lonavala','Lonavala','Nature','Popular hill station known for monsoon greenery, viewpoints, and quick weekend getaways.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Cave_26%2C_Ajanta.jpg/1200px-Cave_26%2C_Ajanta.jpg','Free','Jun-Sep, Nov-Feb',4.4),
    ('Kerala','Wayanad','Wayanad','Nature','A forest-fringed hill district filled with waterfalls, caves, spice plantations, and viewpoints.','https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Boathouse_%287063399547%29.jpg/1200px-Boathouse_%287063399547%29.jpg','Site-based fees','Oct-May',4.7),
    ('Rajasthan','Udaipur City Palace','Udaipur','Heritage','A grand lakeside palace complex overlooking Lake Pichola with courtyards and museums.','https://upload.wikimedia.org/wikipedia/commons/0/09/Thar_Khuri.jpg','INR 300 onwards','Oct-Mar',4.7),
    ('Karnataka','Gokarna','Gokarna','Beach','Laid-back beach town balancing pilgrimage energy with coastal cliffs and sunset coves.','https://upload.wikimedia.org/wikipedia/commons/4/4b/Hampi_virupaksha_temple.jpg','Free','Oct-Mar',4.6),
    ('Tamil Nadu','Rameswaram','Rameswaram','Religious','Island pilgrimage destination known for Ramanathaswamy Temple and coastal bridges.','https://upload.wikimedia.org/wikipedia/commons/f/f2/Mamallapuram_view.jpg','Temple entry free','Nov-Feb',4.7),
    ('Delhi','India Gate','New Delhi','Heritage','Ceremonial boulevard landmark and one of the capital''s most recognisable public spaces.','https://upload.wikimedia.org/wikipedia/commons/4/40/Jama_Masjid_2011.jpg','Free','Oct-Mar',4.5),
    ('West Bengal','Victoria Memorial','Kolkata','Heritage','Marble monument museum in Kolkata surrounded by gardens and colonial-era avenues.','https://upload.wikimedia.org/wikipedia/commons/3/32/Dakhineshwar_Temple_beside_the_Hoogly%2C_West_Bengal.JPG','INR 30 Indians','Oct-Mar',4.6),
    ('Assam','Majuli','Majuli','Nature','The world''s largest river island, known for satras, wetlands, and slow island life.','https://upload.wikimedia.org/wikipedia/commons/f/fe/Beauty_of_Kaziranga_National_Park.jpg','Ferry costs apply','Nov-Mar',4.5),
    ('Andhra Pradesh','Araku Valley','Araku','Nature','A cool hill retreat with coffee plantations, valley viewpoints, caves, and tribal culture.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tirumala_090615.jpg/1200px-Tirumala_090615.jpg','Free','Oct-Mar',4.6),
    ('Arunachal Pradesh','Ziro Valley','Ziro','Nature','A scenic plateau of pine ridges, rice fields, Apatani villages, and slow mountain travel.','https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/TawangMonastery-ArunachalPradesh-1.jpg/1200px-TawangMonastery-ArunachalPradesh-1.jpg','Free','Mar-Oct',4.6),
    ('Bihar','Nalanda Ruins','Nalanda','Heritage','The remains of the legendary ancient university, tied to Buddhist learning and monastic life.','https://upload.wikimedia.org/wikipedia/commons/e/e6/Mahabodhi_temple_complex%2C_Bodhgaya_27.jpg','INR 40 Indians','Oct-Mar',4.5),
    ('Chhattisgarh','Sirpur','Mahasamund','Heritage','An archaeological site known for temple ruins, monasteries, and ancient inscriptions.','https://upload.wikimedia.org/wikipedia/commons/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg','Free','Nov-Feb',4.3),
    ('Gujarat','Gir National Park','Junagadh','Wildlife','The only natural habitat of Asiatic lions, with safari routes through dry forest and scrubland.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Rani_ki_vav_02.jpg/1200px-Rani_ki_vav_02.jpg','Safari charges apply','Dec-Mar',4.7),
    ('Haryana','Sultanpur Bird Sanctuary','Gurugram','Wildlife','Wetland birding destination near Delhi that draws migratory species in winter.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Cyber_City_View.jpg/1200px-Cyber_City_View.jpg','INR 5 Indians','Oct-Feb',4.2),
    ('Jharkhand','Deoghar','Deoghar','Religious','Popular pilgrimage center anchored by Baidyanath Dham and bustling temple streets.','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Views_of_Shikharji_on_way_to_Anantnatha_Tonk_3.jpg/1200px-Views_of_Shikharji_on_way_to_Anantnatha_Tonk_3.jpg','Free','Oct-Mar',4.4),
    ('Manipur','Keibul Lamjao National Park','Bishnupur','Wildlife','The floating national park of Loktak Lake, home to the endangered sangai deer.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_%28edit%29.jpg/1200px-Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_%28edit%29.jpg','INR 30 Indians','Nov-Apr',4.5),
    ('Meghalaya','Dawki River','Dawki','Nature','Known for crystal-clear river water, scenic boat rides, and border-town landscapes.','https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg/1200px-Dawki_River%2C_Meghalaya%2C_India.jpg','Boat charges vary','Oct-May',4.7),
    ('Mizoram','Palak Lake','Saiha','Nature','A serene lake escape surrounded by forested hills in southern Mizoram.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Embossed_Figures_Kawtchhuah_Ropui_Vangchhia_Mapuia_Hnamte_%281%29.JPG/1200px-Embossed_Figures_Kawtchhuah_Ropui_Vangchhia_Mapuia_Hnamte_%281%29.JPG','Free','Oct-Mar',4.2),
    ('Nagaland','Kohima War Cemetery','Kohima','Heritage','A solemn, beautifully maintained memorial tied to the Battle of Kohima.','https://upload.wikimedia.org/wikipedia/commons/c/cb/Kapamodzu.jpg','Free','Oct-May',4.4),
    ('Odisha','Chilika Lake','Puri','Nature','A vast brackish lagoon famous for birdlife, dolphins, and wetland cruises.','https://upload.wikimedia.org/wikipedia/commons/0/0d/Brahmeswar_Temple%2C_Bhubaneswar.JPG','Boat charges vary','Nov-Feb',4.7),
    ('Punjab','Wagah Border','Amritsar','Heritage','A high-energy ceremonial border retreat with patriotic crowds and military pageantry.','https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Golden_Temple%2C_Amritsar%2C_Punjab_UNAG.jpg/1200px-Golden_Temple%2C_Amritsar%2C_Punjab_UNAG.jpg','Free','Oct-Mar',4.5),
    ('Sikkim','Pelling','Pelling','Nature','A quiet mountain town with monastery circuits and sweeping Kanchenjunga views.','https://upload.wikimedia.org/wikipedia/commons/f/f9/Buddha_statue_at_Buddha_Park_of_Ravangla%2C_Sikkim%2C_India_%281%29.jpg','Free','Mar-May, Oct-Dec',4.5),
    ('Telangana','Golconda Fort','Hyderabad','Heritage','A dramatic hill fort complex with acoustic marvels, gateways, and skyline views.','https://upload.wikimedia.org/wikipedia/commons/f/f7/A_typical_charminar_evening.jpg','INR 25 Indians','Oct-Feb',4.7),
    ('Tripura','Unakoti','Unakoti','Heritage','Ancient rock carvings and sculptural reliefs set into green hillsides and forest paths.','https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Tripura_State_Museum_Agartala_Tripura_India.jpg/1200px-Tripura_State_Museum_Agartala_Tripura_India.jpg','INR 20 Indians','Oct-Mar',4.5),
    ('Andaman and Nicobar Islands','Cellular Jail','Port Blair','Heritage','National memorial tied to the freedom struggle, with museum exhibits and evening light shows.','https://upload.wikimedia.org/wikipedia/commons/2/2f/The_Coral_Reef_at_the_Andaman_Islands.jpg','INR 30 Indians','Oct-May',4.5),
    ('Chandigarh','Sukhna Lake','Chandigarh','Nature','Popular waterfront promenade for boating, sunrise walks, and evening leisure.','https://upload.wikimedia.org/wikipedia/commons/7/76/Open_Hand_monument%2C_Chandigarh.jpg','Free','Oct-Mar',4.3),
    ('Dadra and Nagar Haveli and Daman and Diu','Jampore Beach','Daman','Beach','A wide beach known for relaxed sunsets, camel rides, and weekend coastal drives.','https://upload.wikimedia.org/wikipedia/commons/5/5f/Vanganga_Garden%2C_Silvassa_%2832345632184%29.jpg','Free','Nov-Feb',4.2),
    ('Jammu and Kashmir','Dal Lake','Srinagar','Nature','Iconic lake setting with houseboats, shikara rides, and views framed by the Zabarwan range.','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Pahalgam_Valley.jpg/1200px-Pahalgam_Valley.jpg','Boat and stay costs vary','Apr-Oct',4.8),
    ('Lakshadweep','Bangaram Island','Bangaram','Beach','A peaceful island retreat known for lagoons, snorkeling, and barefoot luxury.','https://upload.wikimedia.org/wikipedia/commons/7/72/A_beach_side_resort_at_Kadmat_Island%2C_Lakshadweep.jpg','Permit and stay costs apply','Oct-May',4.7),
    ('Puducherry','Paradise Beach','Puducherry','Beach','Calm beach reachable by boat, popular for soft sand and clear morning light.','https://commons.wikimedia.org/wiki/Special:FilePath/Pondicherry_shoreline.jpg?width=1200','Boat charges apply','Oct-Feb',4.5)
) AS v(state_name, name, location, category, description, image_url, entry_fee, best_time, rating)
JOIN states s ON s.name = v.state_name;

UPDATE destinations SET location = 'Jaipur' WHERE name = 'Hawa Mahal';
UPDATE destinations SET location = 'Jaipur' WHERE name = 'Amber Fort';
UPDATE destinations SET location = 'Jaisalmer' WHERE name = 'Jaisalmer Fort';
UPDATE destinations SET location = 'Sawai Madhopur' WHERE name = 'Ranthambore National Park';
UPDATE destinations SET location = 'Pushkar' WHERE name = 'Pushkar Lake';
UPDATE destinations SET location = 'Alleppey' WHERE name = 'Alleppey Backwaters';
UPDATE destinations SET location = 'Munnar' WHERE name = 'Munnar Tea Gardens';
UPDATE destinations SET location = 'Kovalam' WHERE name = 'Kovalam Beach';
UPDATE destinations SET location = 'Thekkady' WHERE name = 'Periyar Wildlife Sanctuary';
UPDATE destinations SET location = 'Agra' WHERE name = 'Taj Mahal';
UPDATE destinations SET location = 'Varanasi' WHERE name = 'Varanasi Ghats';
UPDATE destinations SET location = 'Agra' WHERE name = 'Agra Fort';
UPDATE destinations SET location = 'Manali' WHERE name = 'Manali';
UPDATE destinations SET location = 'Shimla' WHERE name = 'Shimla';
UPDATE destinations SET location = 'Spiti' WHERE name = 'Spiti Valley';
UPDATE destinations SET location = 'North Goa' WHERE name = 'Calangute Beach';
UPDATE destinations SET location = 'Old Goa' WHERE name = 'Basilica of Bom Jesus';
UPDATE destinations SET location = 'South Goa' WHERE name = 'Dudhsagar Falls';
UPDATE destinations SET location = 'Hampi' WHERE name = 'Hampi';
UPDATE destinations SET location = 'Mysuru' WHERE name = 'Mysore Palace';
UPDATE destinations SET location = 'Kodagu' WHERE name = 'Coorg';
UPDATE destinations SET location = 'Madurai' WHERE name = 'Meenakshi Temple';
UPDATE destinations SET location = 'Ooty' WHERE name = 'Ooty';
UPDATE destinations SET location = 'Mahabalipuram' WHERE name = 'Mahabalipuram';
UPDATE destinations SET location = 'Kaziranga' WHERE name = 'Kaziranga National Park';
UPDATE destinations SET location = 'Khajuraho' WHERE name = 'Khajuraho Temples';
UPDATE destinations SET location = 'Umaria' WHERE name = 'Bandhavgarh National Park';
UPDATE destinations SET location = 'Leh' WHERE name = 'Pangong Lake';
UPDATE destinations SET location = 'Nubra' WHERE name = 'Nubra Valley';
UPDATE destinations SET location = 'Old Delhi' WHERE name = 'Red Fort';
UPDATE destinations SET location = 'Mehrauli' WHERE name = 'Qutub Minar';
UPDATE destinations SET location = 'Rishikesh' WHERE name = 'Rishikesh';
UPDATE destinations SET location = 'Chamoli' WHERE name = 'Valley of Flowers';
UPDATE destinations SET location = 'Swaraj Dweep' WHERE name = 'Radhanagar Beach';
UPDATE destinations SET location = 'Port Blair' WHERE name = 'Cellular Jail';
UPDATE destinations SET location = 'Darjeeling' WHERE name = 'Darjeeling';
UPDATE destinations SET location = 'Sundarbans' WHERE name = 'Sundarbans';

INSERT INTO gallery_images (title, location, state, image_url, category)
VALUES
  ('Tirupati Temple Lights', 'Tirupati', 'Andhra Pradesh', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tirumala_090615.jpg/1200px-Tirumala_090615.jpg', 'Religious'),
  ('Rann of Kutch White Desert', 'Kutch', 'Gujarat', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Rani_ki_vav_02.jpg/1200px-Rani_ki_vav_02.jpg', 'Nature'),
  ('Golden Temple Reflection', 'Amritsar', 'Punjab', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Golden_Temple%2C_Amritsar%2C_Punjab_UNAG.jpg/1200px-Golden_Temple%2C_Amritsar%2C_Punjab_UNAG.jpg', 'Religious'),
  ('Charminar Evenings', 'Hyderabad', 'Telangana', 'https://upload.wikimedia.org/wikipedia/commons/f/f7/A_typical_charminar_evening.jpg', 'Heritage'),
  ('Rock Garden Paths', 'Chandigarh', 'Chandigarh', 'https://upload.wikimedia.org/wikipedia/commons/7/76/Open_Hand_monument%2C_Chandigarh.jpg', 'Heritage'),
  ('Gulmarg Slopes', 'Gulmarg', 'Jammu and Kashmir', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Pahalgam_Valley.jpg/1200px-Pahalgam_Valley.jpg', 'Adventure');
