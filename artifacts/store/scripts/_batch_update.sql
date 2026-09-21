BEGIN;
UPDATE "Product" SET images=ARRAY['https://res.cloudinary.com/dbzdls18g/image/fetch/q_auto,f_auto/https://cdn.bkmkitap.com/faber-castell-seffaf-govde-fosforlu-kalem-mavi-13986663-44-O.jpg'], "updatedAt"=NOW(), price=74.25 WHERE id='cmph3mnpn05zrszcwmlztnnfv';
UPDATE "Product" SET images=ARRAY['https://res.cloudinary.com/dbzdls18g/image/fetch/q_auto,f_auto/https://cdn.bkmkitap.com/ucurtma-avcisi-13935089-22-O.jpg'], "updatedAt"=NOW(), price=373.75 WHERE id='cmph3mus20629szcwdjpnegd7';
UPDATE "Product" SET images=ARRAY['https://res.cloudinary.com/dbzdls18g/image/fetch/q_auto,f_auto/https://cdn.bkmkitap.com/katlanabilir-dualar-11631408-25-O.jpg'], "updatedAt"=NOW(), price=20.1 WHERE id='cmph3mwi7062xszcwms96m26x';
UPDATE "Product" SET images=ARRAY['https://res.cloudinary.com/dbzdls18g/image/fetch/q_auto,f_auto/https://cdn.bkmkitap.com/canta-boy-siracun-nur-mecmuasi-mukayeseli-12477513-72-O.jpg'], "updatedAt"=NOW(), price=64.8 WHERE id='cmph3mwsj0631szcwa1ivkv2g';
UPDATE "Product" SET images=ARRAY['https://res.cloudinary.com/dbzdls18g/image/fetch/q_auto,f_auto/https://cdn.bkmkitap.com/kursun-kalem-13905154-83-O.jpg'], "updatedAt"=NOW(), price=97.5 WHERE id='cmph3oj5h06nxszcwt2afce8h';
COMMIT;
