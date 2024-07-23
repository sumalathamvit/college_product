const Dropdown = ({ submenus, dropdown, currentPage }) => {
  return (
    <ul className={`dropdown${dropdown === true ? "show" : ""}`}>
      {submenus.map((submenu, index) => (
        <a
          key={index}
          className={`list-group-item ${
            submenu.url == "/" + currentPage ? "active" : ""
          }`}
          href={submenu.url}
        >
          {submenu.title}
        </a>
      ))}
    </ul>
  );
};

export default Dropdown;
