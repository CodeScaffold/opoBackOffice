import Form from "./Form.tsx";
import Login from "../Login.tsx";
import { useAuth } from "../hooks/auth";

const MainPage = () => {
  const { isAuth } = useAuth();
  return <>{isAuth ? <Form /> : <Login />}</>;
};
export default MainPage;
