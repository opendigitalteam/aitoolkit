// type EnrichRequest = {};

// export default function Enrich(request: EnrichRequest) {}

// async function example() {
//   const enrichedItems = await Enrich({
//     items: ["100", "200", "300"],
//     pipeline: [
//       // items processed sequentially
//       [async (item: any) => ({ id: item })],
//       [
//         // sub arrays processed in parallel
//         async (item: any) => ({ ...item, name: "John Doe" }),
//         async (item: any) => ({ ...item, age: 30 }),
//       ],
//     ],
//   });
// }
