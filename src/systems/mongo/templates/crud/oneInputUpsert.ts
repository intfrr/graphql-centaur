export const oneInputUpsert = ({
  collection,
  pk,
  resolverName,
  resolverParent,
  input,
}: {
  collection: string;
  pk: string;
  resolverName: string;
  resolverParent: string;
  input: string;
}) => `
import { IFieldResolveInput, IFieldResolveOutput } from "stucco-js";
import { ${collection} } from "../db/collections";
import { DB } from "../db/mongo";
import { ResolverType, ValueTypes } from "../graphql-zeus";
import { Utils } from "../Utils";${pk === 'id' ? `\nimport { ObjectID } from "bson";` : ''}

export const handler = async (
  input: IFieldResolveInput,
): Promise<IFieldResolveOutput> => {
  try {
    const { ${pk},...args } = input.arguments as ResolverType<ValueTypes["${resolverParent}"]["${resolverName}"]>
    const db = await DB();
    const col = await db.collection(${collection});
    const o = await col.findOneAndUpdate(
      ${pk === 'id' ? `{ _id: new ObjectID(${pk})  }` : `{ ${pk} }`},
      { $set: args.${input} },
      { upsert: true, returnOriginal: false },
    );
    return {
      response: Utils.mongoToGraphQL(o.value),
    };
  } catch (error) {
    return { error };
  }
};
`;