import client from "./client";

const getAllBrand = async (limit) => {
  const data = await client.get(
    `/api/resource/Brand?fields=["*"]&order_by=name asc&limit_page_length=${limit}`
  );
  return data;
};

const addBrand = async (brand, description) => {
  const data = await client.post(`/api/resource/Brand`, { brand, description });
  return data;
};

const updateBrand = async (name, brand, description) => {
  const data = await client.put(`/api/resource/Brand/${name}`, {
    name: brand,
    brand,
    description,
  });
  return data;
};

const searchBrand = async (name) => {
  const data = await client.get(
    `/api/resource/Brand?fields=["*"]&filters=[["brand","like","${name}%"]]`
  );
  return data;
};

const getItemGroup = async () => {
  const data = await client.get(
    `/api/resource/Item Group?fields=["*"]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const addItemGroup = async (item_group_name) => {
  const data = await client.post(`/api/resource/Item Group`, {
    item_group_name,
  });
  return data;
};

const doctypeRename = async (doctype, docname, name) => {
  const data = await client.post(
    "/api/method/frappe.model.rename_doc.update_document_title",
    {
      doctype,
      docname,
      name,
    }
  );
  return data;
};

const getAssetCategory = async () => {
  const data = await client.get(
    `/api/resource/Asset Category?fields=["*"]&order_by=name asc&limit_page_length=None`
  );
  return data;
};

const getUOM = async (limit) => {
  const data = await client.get(
    `/api/resource/UOM?fields=["*"]&order_by=name asc&limit_page_length=${limit}`
  );
  return data;
};

const getItemAttribute = async (limit) => {
  const data = await client.get(
    `/api/resource/Item Attribute?fields=["*"]&order_by=name asc&limit_page_length=${limit}`
  );
  return data;
};

const getItemAttributeById = async (id) => {
  const data = await client.get(`/api/resource/Item Attribute/${id}`);
  return data;
};

export default {
  getAllBrand,
  addBrand,
  updateBrand,
  searchBrand,
  getItemGroup,
  addItemGroup,
  doctypeRename,
  getAssetCategory,
  getUOM,
  getItemAttribute,
  getItemAttributeById,
};
