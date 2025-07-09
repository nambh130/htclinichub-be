import { ActorType } from "@app/common/enum/actor-type";

type AuthResponse = {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    actorType: ActorType;
    roles: string[];
    currentClinics: any[];
    adminOf: any[];
  };
};

export default AuthResponse
